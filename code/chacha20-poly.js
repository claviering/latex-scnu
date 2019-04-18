// 8 bit 转 32 bit
function U8TO32_LE(x, i) {
  return x[i] | (x[i+1]<<8) | (x[i+2]<<16) | (x[i+3]<<24);
}

function U32TO8_LE(x, i, u) {
  x[i]   = u; u >>>= 8;
  x[i+1] = u; u >>>= 8;
  x[i+2] = u; u >>>= 8;
  x[i+3] = u;
}

function ROTATE(v, c) {
  return (v << c) | (v >>> (32 - c));
}

var Chacha20 = function(key, nonce, counter) {
  this.input = new Uint32Array(16);

  // https://tools.ietf.org/html/draft-irtf-cfrg-chacha20-poly1305-01#section-2.3
  this.input[0] = 1634760805;
  this.input[1] =  857760878;
  this.input[2] = 2036477234;
  this.input[3] = 1797285236;
  this.input[4] = U8TO32_LE(key, 0);
  this.input[5] = U8TO32_LE(key, 4);
  this.input[6] = U8TO32_LE(key, 8);
  this.input[7] = U8TO32_LE(key, 12);
  this.input[8] = U8TO32_LE(key, 16);
  this.input[9] = U8TO32_LE(key, 20);
  this.input[10] = U8TO32_LE(key, 24);
  this.input[11] = U8TO32_LE(key, 28);
  this.input[12] = counter;
  this.input[13] = U8TO32_LE(nonce, 0);
  this.input[14] = U8TO32_LE(nonce, 4);
  this.input[15] = U8TO32_LE(nonce, 8);
};

Chacha20.prototype.quarterRound = function(x, a, b, c, d) {
  x[a] += x[b]; x[d] = ROTATE(x[d] ^ x[a], 16);
  x[c] += x[d]; x[b] = ROTATE(x[b] ^ x[c], 12);
  x[a] += x[b]; x[d] = ROTATE(x[d] ^ x[a],  8);
  x[c] += x[d]; x[b] = ROTATE(x[b] ^ x[c],  7);
};

Chacha20.prototype.encrypt = function(dst, src, len) {
  var x = new Uint32Array(16);
  var output = new Uint8Array(64);
  var i, dpos = 0, spos = 0;

  while (len > 0 ) {
    for (i = 16; i--;) x[i] = this.input[i];
    for (i = 20; i > 0; i -= 2) {
      this.quarterRound(x, 0, 4, 8,12);
      this.quarterRound(x, 1, 5, 9,13);
      this.quarterRound(x, 2, 6,10,14);
      this.quarterRound(x, 3, 7,11,15);
      this.quarterRound(x, 0, 5,10,15);
      this.quarterRound(x, 1, 6,11,12);
      this.quarterRound(x, 2, 7, 8,13);
      this.quarterRound(x, 3, 4, 9,14);
    }
    for (i = 16; i--;) x[i] += this.input[i];
    for (i = 16; i--;) U32TO8_LE(output, 4*i, x[i]);

    this.input[12] += 1;
    if (!this.input[12]) {
      this.input[13] += 1;
    }
    if (len <= 64) {
      for (i = len; i--;) {
        dst[i+dpos] = src[i+spos] ^ output[i];
      }
      return;
    }
    for (i = 64; i--;) {
      dst[i+dpos] = src[i+spos] ^ output[i];
    }
    len -= 64;
    spos += 64;
    dpos += 64;
  }
};

Chacha20.prototype.keystream = function(dst, len) {
  for (var i = 0; i < len; ++i) dst[i] = 0;
  this.encrypt(dst, dst, len);
};

/* poly1305 */
 
var Poly1305KeySize = 32;
var Poly1305TagSize = 16;
 
var Poly1305 = function(key) {
  this.buffer = new Uint8Array(16);
  this.leftover = 0;
  this.r = new Uint16Array(10);
  this.h = new Uint16Array(10);
  this.pad = new Uint16Array(8);
  this.finished = 0;

  var t = new Uint16Array(8), i;
 
  for (i = 8; i--;) t[i] = U8TO16_LE(key, i*2);
 
  this.r[0] =   t[0]                         & 0x1fff;
  this.r[1] = ((t[0] >>> 13) | (t[1] <<  3)) & 0x1fff;
  this.r[2] = ((t[1] >>> 10) | (t[2] <<  6)) & 0x1f03;
  this.r[3] = ((t[2] >>>  7) | (t[3] <<  9)) & 0x1fff;
  this.r[4] = ((t[3] >>>  4) | (t[4] << 12)) & 0x00ff;
  this.r[5] =  (t[4] >>>  1)                 & 0x1ffe;
  this.r[6] = ((t[4] >>> 14) | (t[5] <<  2)) & 0x1fff;
  this.r[7] = ((t[5] >>> 11) | (t[6] <<  5)) & 0x1f81;
  this.r[8] = ((t[6] >>>  8) | (t[7] <<  8)) & 0x1fff;
  this.r[9] =  (t[7] >>>  5)                 & 0x007f;
 
  for (i = 8; i--;) {
    this.h[i]   = 0;
    this.pad[i] = U8TO16_LE(key, 16+(2*i));
  }
  this.h[8] = 0;
  this.h[9] = 0;
  this.leftover = 0;
  this.finished = 0;  
};

function U8TO16_LE(p, pos) {
  return (p[pos] & 0xff) | ((p[pos+1] & 0xff) << 8);
}
 
function U16TO8_LE(p, pos, v) {
  p[pos]   = v;
  p[pos+1] = v >>> 8;
}

Poly1305.prototype.blocks = function(m, mpos, bytes) {
  var hibit = this.finished ? 0 : (1 << 11);
  var t = new Uint16Array(8),
      d = new Uint32Array(10),
      c = 0, i = 0, j = 0;
 
  while (bytes >= 16) {
    for (i = 8; i--;) t[i] = U8TO16_LE(m, i*2+mpos);
 
    this.h[0] +=   t[0]                         & 0x1fff;
    this.h[1] += ((t[0] >>> 13) | (t[1] <<  3)) & 0x1fff;
    this.h[2] += ((t[1] >>> 10) | (t[2] <<  6)) & 0x1fff;
    this.h[3] += ((t[2] >>>  7) | (t[3] <<  9)) & 0x1fff;
    this.h[4] += ((t[3] >>>  4) | (t[4] << 12)) & 0x1fff;
    this.h[5] +=  (t[4] >>>  1)                 & 0x1fff;
    this.h[6] += ((t[4] >>> 14) | (t[5] <<  2)) & 0x1fff;
    this.h[7] += ((t[5] >>> 11) | (t[6] <<  5)) & 0x1fff;
    this.h[8] += ((t[6] >>>  8) | (t[7] <<  8)) & 0x1fff;
    this.h[9] +=  (t[7] >>>  5)                 | hibit;
 
    for (i = 0, c = 0; i < 10; i++) {
      d[i] = c;
      for (j = 0; j < 10; j++) {
        d[i] += (this.h[j] & 0xffffffff) * ((j <= i) ? this.r[i-j] : (5 * this.r[i+10-j]));
        if (j === 4) {
          c = (d[i] >>> 13);
          d[i] &= 0x1fff;
        }
      }
      c += (d[i] >>> 13);
      d[i] &= 0x1fff;
    }
    c = ((c << 2) + c);
    c += d[0];
    d[0] = ((c & 0xffff) & 0x1fff);
    c = (c >>> 13);
    d[1] += c;
 
    for (i = 10; i--;) this.h[i] = d[i];
 
    mpos += 16;
    bytes -= 16;
  }
};

Poly1305.prototype.update = function(m, bytes) {
  var want = 0, i = 0, mpos = 0;
 
  if (this.leftover) {
    want = 16 - this.leftover;
    if (want > bytes)
      want = bytes;
    for (i = want; i--;) {
      this.buffer[this.leftover+i] = m[i+mpos];
    }
    bytes -= want;
    mpos += want;
    this.leftover += want;
    if (this.leftover < 16)
      return;
    this.blocks(this.buffer, 0, 16);
    this.leftover = 0;    
  }
 
  if (bytes >= 16) {
    want = (bytes & ~(16 - 1));
    this.blocks(m, mpos, want);
    mpos += want;
    bytes -= want;
  }
 
  if (bytes) {
    for (i = bytes; i--;) {
      this.buffer[this.leftover+i] = m[i+mpos];
    }
    this.leftover += bytes;
  }
};
 
Poly1305.prototype.finish = function() {
  var mac = new Uint8Array(16),
      g = new Uint16Array(10),
      c = 0, mask = 0, f = 0, i = 0;
 
  if (this.leftover) {
    i = this.leftover;
    this.buffer[i++] = 1;
    for (; i < 16; i++) {
      this.buffer[i] = 0;
    }
    this.finished = 1;
    this.blocks(this.buffer, 0, 16);
  }
 
  c = this.h[1] >>> 13;
  this.h[1] &= 0x1fff;
  for (i = 2; i < 10; i++) {
    this.h[i] += c;
    c = this.h[i] >>> 13;
    this.h[i] &= 0x1fff;
  }
  this.h[0] += (c * 5);
  c = this.h[0] >>> 13;
  this.h[0] &= 0x1fff;
  this.h[1] += c;
  c = this.h[1] >>> 13;
  this.h[1] &= 0x1fff;
  this.h[2] += c;
 
  g[0] = this.h[0] + 5;
  c = g[0] >>> 13;
  g[0] &= 0x1fff;
  for (i = 1; i < 10; i++) {
    g[i] = this.h[i] + c;
    c = g[i] >>> 13;
    g[i] &= 0x1fff;
  }
  g[9] -= (1 << 13);
 
  mask = (g[9] >>> 15) - 1;
  for (i = 10; i--;) g[i] &= mask;
  mask = ~mask;
  for (i = 10; i--;) {
    this.h[i] = (this.h[i] & mask) | g[i];
  }
 
  this.h[0] = (this.h[0]      ) | (this.h[1] << 13);
  this.h[1] = (this.h[1] >>  3) | (this.h[2] << 10);
  this.h[2] = (this.h[2] >>  6) | (this.h[3] <<  7);
  this.h[3] = (this.h[3] >>  9) | (this.h[4] <<  4);
  this.h[4] = (this.h[4] >> 12) | (this.h[5] <<  1) | (this.h[6] << 14);
  this.h[5] = (this.h[6] >>  2) | (this.h[7] << 11);
  this.h[6] = (this.h[7] >>  5) | (this.h[8] <<  8);
  this.h[7] = (this.h[8] >>  8) | (this.h[9] <<  5);
 
  f = (this.h[0] & 0xffffffff) + this.pad[0];
  this.h[0] = f;
  for (i = 1; i < 8; i++) {
    f = (this.h[i] & 0xffffffff) + this.pad[i] + (f >>> 16);
    this.h[i] = f;
  }
 
  for (i = 8; i--;) {
    U16TO8_LE(mac, i*2, this.h[i]);
    this.pad[i] = 0;
  }
  for (i = 10; i--;) {
    this.h[i] = 0;
    this.r[i] = 0;
  }

  return mac;
};

function poly1305_auth(m, bytes, key) {
  var ctx = new Poly1305(key);
  ctx.update(m, bytes);
  return ctx.finish();
}

function poly1305_verify(mac1, mac2) {
  var dif = 0;
  for (var i = 0; i < 16; i++) {
    dif |= (mac1[i] ^ mac2[i]);
  }
  dif = (dif - 1) >>> 31;
  return (dif & 1);
}

function store64(dst, num) {
  var hi = 0, lo = num >>> 0;
  if ((+(Math.abs(num))) >= 1) {
    if (num > 0) {
      hi = ((Math.min((+(Math.floor(num/4294967296))), 4294967295))|0) >>> 0;
    } else {
      hi = (~~((+(Math.ceil((num - +(((~~(num)))>>>0))/4294967296))))) >>> 0;
    }
  }
  dst.push(lo & 0xff); lo >>>= 8;
  dst.push(lo & 0xff); lo >>>= 8;
  dst.push(lo & 0xff); lo >>>= 8;
  dst.push(lo & 0xff);
  dst.push(hi & 0xff); hi >>>= 8;
  dst.push(hi & 0xff); hi >>>= 8;
  dst.push(hi & 0xff); hi >>>= 8;
  dst.push(hi & 0xff);
}

function aead_mac(polykey, data, ciphertext) {
  var dlen = data.length,
      clen = ciphertext.length,
      dpad = dlen % 16,
      cpad = clen % 16,
      m = [], i;

  for (i = 0; i < dlen; i++) m.push(data[i]);

  if (dpad !== 0) {
    for (i = (16 - dpad); i--;) m.push(0);
  }

  for (i = 0; i < clen; i++) m.push(ciphertext[i]);

  if (cpad !== 0) {
    for (i = (16 - cpad); i--;) m.push(0);
  }

  store64(m, dlen);
  store64(m, clen);

  return poly1305_auth(m, m.length, polykey);
}

function aead_encrypt(key, nonce, plaintext, data) {
  var plen = plaintext.length,
      buf = new Uint8Array(plen),
      ciphertext = new Uint8Array(plen),
      polykey = new Uint8Array(64),
      ctx = new Chacha20(key, nonce, 0);

  ctx.keystream(polykey, 64);

  ctx.keystream(buf, plen);

  for (var i = 0; i < plen; i++) {
    ciphertext[i] = buf[i] ^ plaintext[i];
  }

  return [ciphertext, aead_mac(polykey, data, ciphertext)];
}

function aead_decrypt(key, nonce, ciphertext, data, mac) {
  var plen = ciphertext.length,
      buf = new Uint8Array(plen),
      plaintext = new Uint8Array(plen),
      polykey = new Uint8Array(64),
      ctx = new Chacha20(key, nonce, 0);

  ctx.keystream(polykey, 64);

  var tag = aead_mac(polykey, data, ciphertext);

  if (poly1305_verify(tag, mac) !== 1) return false;

  ctx.keystream(buf, plen);

  for (var i = 0; i < plen; i++) {
    plaintext[i] = buf[i] ^ ciphertext[i];
  }

  return plaintext;
}

function stringToASCIIList (string) {
  let list = []
  for (let i = 0; i < string.length; i++) {
    list.push(string.charCodeAt(i))
  }
  return list
}

module.exports = (key, plaintext, nonce, counter = 0) => {
  if (!key || !plaintext || !nonce) {
    new Error('key, plaintext and nonce must not empty')
    return
  }
  key = stringToASCIIList(key)
  plaintext = stringToASCIIList(plaintext)
  nonce = stringToASCIIList(nonce)
  let len = plaintext.length
  let buf = new Uint8Array(len)
  let output = new Uint8Array(len)
  let ctx = new Chacha20(key, nonce, counter);
  ctx.keystream(buf, len);
  for (let j = 0; j < len; j++) {
    output[j] = buf[j] ^ plaintext[j];
  }
  console.log(output)
  let s = String.fromCharCode(...output)
  return output.toString('hex')
}