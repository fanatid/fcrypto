module.exports = ({ fns, heapu8, heap32 }) => {
  // TODO:
  // zero filling after function call

  return class Secp256k1 {
    constructor() {
      this.ctx = fns.fcrypto_secp256k1_context_create()
      this.seckey = fns.malloc(32)
      this.pubkey = fns.malloc(65)
      this.msg32 = fns.malloc(32)
      this.signature = fns.malloc(64)
      this.recid = fns.malloc(4)
    }

    publicKeyCreate(output, seckey, outputlen) {
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
    }

    ecdsaSign(sig, msg32, seckey) {
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
    }

    ecdsaVerify(signature, msg32, pubkey) {
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
