#!/usr/bin/env python3
import hashlib
import hmac
from math import ceil

hash_len = 32
def hmac_sha256(key, data):
    return hmac.new(key, data, hashlib.sha256).digest()

def hkdf(length, ikm, salt=b"", info=b""):
    prk = hmac_sha256(salt if len(salt) > 0 else bytes([0]*hash_len), ikm)
    t = b""
    okm = b""
    for i in range(ceil(length / hash_len)):
        t = hmac_sha256(prk, t + info + bytes([1+i]))
        okm += t
    return okm[:length]
