const nonce = require('./nonce')
const { createHash, createHmac } = require( 'crypto' );

function hash_length( hash ) {
    switch ( hash ) {
    case 'sha256': return 32;
    case 'sha512': return 64;
    case 'sha224': return 28;
    case 'sha384': return 48;
    case 'sha1': return 20;
    case 'md5': return 16;
    default: return createHash( hash ).digest().length;
    }
};

function hkdf_extract( hash, hash_len, ikm, salt ) {
    const b_ikm = Buffer.isBuffer( ikm ) ? ikm : Buffer.from( ikm );
    const b_salt = ( salt && salt.length ) ? Buffer.from( salt ) : Buffer.alloc( hash_len, 0 );

    return createHmac( hash, b_salt ).update( b_ikm ).digest();
};


function hkdf_expand( hash, hash_len, prk, length, info ) {
    const b_info = Buffer.from( info || '' );
    const info_len = b_info.length;
    const steps = Math.ceil( length / hash_len );
    if ( steps > 0xFF ) {
        throw new Error( `OKM length ${length} is too long for ${hash} hash` );
    }
    // use single buffer with unnecessary create/copy/move operations
    const t = Buffer.alloc( hash_len * steps + info_len + 1 );
    // T = T(1) | T(2) | T(3) | ... | T(N)
    for ( let c = 1, start = 0, end = 0; c <= steps; ++c ) {
        // add info
        b_info.copy( t, end );
        // add counter
        t[ end + info_len ] = c;

        createHmac( hash, prk )
            // use view: T(C) = T(C-1) | info | C
            // 取T(C-1) t.slice( start, end + info_len + 1 )
            .update( t.slice( start, end + info_len + 1 ) )
            .digest()
            // put back to the same buffer
            // end 目标开始的位置
            // buf1.copy(buf2, 8); buf1 复制到 buf2 8 位置开始里
            .copy( t, end );
        start = end; // used for T(C-1) start
        end += hash_len; // used for T(C-1) end & overall end
    }
    return t.slice( 0, length );
};

function hkdf( ikm, length, { salt='', info='', hash='SHA-256' } = {} ) {
    salt = nonce(length)
    hash = hash.toLowerCase().replace( '-', '' );
    // 0. Hash length
    const hash_len = 32
    // 1. extract
    const prk = hkdf_extract( hash, hash_len, ikm, salt );
    // 2. expand
    return hkdf_expand( hash, hash_len, prk, length, info );
}

module.exports = (ikm, length = 16, info = '', hash = 'SHA-256') => {
  let salt = nonce(length)
  return hkdf(ikm, length, {salt, info, hash}).toString('hex')
}