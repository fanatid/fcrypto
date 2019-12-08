module.exports = ({ fns, heapu8, heap32 }) => {
  return class Secp256k1 {
    constructor () {
      this.ctx = fns.fcrypto_secp256k1_context_create()

      this.seed = fns.malloc(32)
      this.seckey = fns.malloc(32)
      this.pubkey = fns.malloc(65)
      this.msg32 = fns.malloc(32)
      this.signature = fns.malloc(64)
      this.recid = fns.malloc(4)

      const zeros = new Uint8Array(32)
      this.z32 = zeros.subarray(0, 32)
    }

    randomize (seed) {
      if (seed === null) {
        return fns.fcrypto_secp256k1_context_randomize(this.ctx, null)
      }

      try {
        heapu8.set(seed, this.seed)
        return fns.fcrypto_secp256k1_context_randomize(this.ctx, this.seed)
      } finally {
        heapu8.set(this.z32, this.seed)
      }
    }

    privateKeyVerify (seckey) {
      try {
        heapu8.set(seckey, this.seckey)
        return fns.fcrypto_secp256k1_seckey_verify(this.ctx, this.seckey)
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }

    publicKeyCreate (output, seckey, outputlen) {
      try {
        heapu8.set(seckey, this.seckey)

        const ret = fns.fcrypto_secp256k1_pubkey_create(
          this.ctx,
          this.pubkey,
          this.seckey,
          outputlen
        )
        if (ret === 0) {
          output.set(heapu8.subarray(this.seckey, this.seckey + 33), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }

    ecdsaSign (sig, msg32, seckey) {
      try {
        heapu8.set(msg32, this.msg32)
        heapu8.set(seckey, this.seckey)

        const ret = fns.fcrypto_secp256k1_ecdsa_sign(
          this.ctx,
          this.signature,
          this.recid,
          this.msg32,
          this.seckey
        )
        if (ret === 0) {
          sig.signature.set(
            heapu8.subarray(this.signature, this.signature + 64),
            0
          )
          sig.recid = heap32[this.recid / 4]
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }

    ecdsaVerify (signature, msg32, pubkey) {
      heapu8.set(signature, this.signature)
      heapu8.set(msg32, this.msg32)
      heapu8.set(pubkey, this.pubkey)

      return fns.fcrypto_secp256k1_ecdsa_verify(
        this.ctx,
        this.signature,
        this.msg32,
        this.pubkey,
        pubkey.length
      )
    }
  }
}
