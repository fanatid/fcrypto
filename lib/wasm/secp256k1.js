module.exports = ({ fns, heapu8, heap32 }) => {
  return class Secp256k1 {
    constructor () {
      this.ctx = fns.fcrypto_secp256k1_context_create()

      this.seed = fns.malloc(32)
      this.seckey = fns.malloc(32)
      this.pubkey = fns.malloc(65)
      this.msg32 = fns.malloc(32)
      this.sig72 = fns.malloc(72)
      this.outputlen = fns.malloc(4)
      this.recid = fns.malloc(4)
      this.tweak = fns.malloc(32)
      this.hash32 = fns.malloc(32)

      const zeros = new Uint8Array(32)
      this.z32 = zeros.subarray(0, 32)
    }

    contextRandomize (seed) {
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

    privateKeyNegate (seckey) {
      try {
        heapu8.set(seckey, this.seckey)

        const ret = fns.fcrypto_secp256k1_seckey_negate(this.ctx, this.seckey)
        if (ret === 0) {
          seckey.set(heapu8.subarray(this.seckey, this.seckey + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }

    privateKeyTweakAdd (seckey, tweak) {
      try {
        heapu8.set(seckey, this.seckey)
        heapu8.set(tweak, this.tweak)

        const ret = fns.fcrypto_secp256k1_seckey_tweak_add(
          this.ctx,
          this.seckey,
          this.tweak
        )
        if (ret === 0) {
          seckey.set(heapu8.subarray(this.seckey, this.seckey + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
        heapu8.set(this.z32, this.tweak)
      }
    }

    privateKeyTweakMul (seckey, tweak) {
      try {
        heapu8.set(seckey, this.seckey)
        heapu8.set(tweak, this.tweak)

        const ret = fns.fcrypto_secp256k1_seckey_tweak_mul(
          this.ctx,
          this.seckey,
          this.tweak
        )
        if (ret === 0) {
          seckey.set(heapu8.subarray(this.seckey, this.seckey + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
        heapu8.set(this.z32, this.tweak)
      }
    }

    publicKeyCreate (output, seckey) {
      try {
        heapu8.set(seckey, this.seckey)

        const ret = fns.fcrypto_secp256k1_pubkey_create(
          this.ctx,
          this.pubkey,
          this.seckey,
          output.length
        )
        if (ret === 0) {
          const offset = this.pubkey
          output.set(heapu8.subarray(offset, offset + output.length), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }

    publicKeyConvert (output, pubkey) {
      heapu8.set(pubkey, this.pubkey)

      const ret = fns.fcrypto_secp256k1_pubkey_convert(
        this.ctx,
        this.pubkey,
        this.pubkey,
        pubkey.length,
        output.length
      )
      if (ret === 0) {
        const offset = this.pubkey
        output.set(heapu8.subarray(offset, offset + output.length), 0)
      }

      return ret
    }

    publicKeyNegate (output, pubkey) {
      heapu8.set(pubkey, this.pubkey)

      const ret = fns.fcrypto_secp256k1_pubkey_negate(
        this.ctx,
        this.pubkey,
        this.pubkey,
        pubkey.length,
        output.length
      )
      if (ret === 0) {
        const offset = this.pubkey
        output.set(heapu8.subarray(offset, offset + output.length), 0)
      }

      return ret
    }

    publicKeyCombine (output, pubkeys) {
      let inputs, inputslen
      try {
        // while wasm is 32bit, pointer size is 4
        inputs = fns.malloc(4 * pubkeys.length) / 4
        inputslen = fns.malloc(4 * pubkeys.length) / 4

        for (let i = 0; i < pubkeys.length; ++i) {
          const pubkey = pubkeys[i]
          heap32[inputs + i] = fns.malloc(pubkey.length)
          heapu8.set(pubkey, heap32[inputs + i])
          heap32[inputslen + i] = pubkey.length
        }

        const ret = fns.fcrypto_secp256k1_pubkey_combine(
          this.ctx,
          this.pubkey,
          inputs * 4,
          inputslen * 4,
          pubkeys.length,
          output.length
        )
        if (ret === 0) {
          const offset = this.pubkey
          output.set(heapu8.subarray(offset, offset + output.length), 0)
        }

        return ret
      } finally {
        if (inputs) {
          for (let i = 0; i < pubkeys.length; ++i) {
            fns.free(heap32[inputs + i])
          }
        }

        fns.free(inputs * 4)
        fns.free(inputslen * 4)
      }
    }

    publicKeyTweakAdd (output, pubkey, tweak) {
      try {
        heapu8.set(pubkey, this.pubkey)
        heapu8.set(tweak, this.tweak)

        const ret = fns.fcrypto_secp256k1_pubkey_tweak_add(
          this.ctx,
          this.pubkey,
          this.pubkey,
          pubkey.length,
          this.tweak,
          output.length
        )
        if (ret === 0) {
          const offset = this.pubkey
          output.set(heapu8.subarray(offset, offset + output.length), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.tweak)
      }
    }

    publicKeyTweakMul (output, pubkey, tweak) {
      try {
        heapu8.set(pubkey, this.pubkey)
        heapu8.set(tweak, this.tweak)

        const ret = fns.fcrypto_secp256k1_pubkey_tweak_mul(
          this.ctx,
          this.pubkey,
          this.pubkey,
          pubkey.length,
          this.tweak,
          output.length
        )
        if (ret === 0) {
          const offset = this.pubkey
          output.set(heapu8.subarray(offset, offset + output.length), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.tweak)
      }
    }

    signatureNormalize (sig) {
      heapu8.set(sig, this.sig72)

      const ret = fns.fcrypto_secp256k1_signature_normalize(
        this.ctx,
        this.sig72
      )
      if (ret === 0) {
        sig.set(heapu8.subarray(this.sig72, this.sig72 + 64), 0)
      }

      return ret
    }

    signatureExport (obj, sig) {
      heapu8.set(sig, this.sig72)
      heap32[this.outputlen / 4] = 72

      const ret = fns.fcrypto_secp256k1_signature_export(
        this.ctx,
        this.sig72,
        this.outputlen,
        this.sig72
      )
      if (ret === 0) {
        obj.outputlen = heap32[this.outputlen / 4]
        obj.output.set(
          heapu8.subarray(this.sig72, this.sig72 + obj.outputlen),
          0
        )
      }

      return ret
    }

    signatureImport (output, sig) {
      heapu8.set(sig, this.sig72)

      const ret = fns.fcrypto_secp256k1_signature_import(
        this.ctx,
        this.sig72,
        this.sig72,
        sig.length
      )
      if (ret === 0) {
        output.set(heapu8.subarray(this.sig72, this.sig72 + 64), 0)
      }

      return ret
    }

    ecdsaSign (obj, msg32, seckey) {
      try {
        heapu8.set(msg32, this.msg32)
        heapu8.set(seckey, this.seckey)

        const ret = fns.fcrypto_secp256k1_ecdsa_sign(
          this.ctx,
          this.sig72,
          this.recid,
          this.msg32,
          this.seckey
        )
        if (ret === 0) {
          obj.signature.set(heapu8.subarray(this.sig72, this.sig72 + 64), 0)
          obj.recid = heap32[this.recid / 4]
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }

    ecdsaVerify (sig, msg32, pubkey) {
      heapu8.set(sig, this.sig72)
      heapu8.set(msg32, this.msg32)
      heapu8.set(pubkey, this.pubkey)

      return fns.fcrypto_secp256k1_ecdsa_verify(
        this.ctx,
        this.sig72,
        this.msg32,
        this.pubkey,
        pubkey.length
      )
    }

    ecdsaRecover (output, sig, recid, msg32) {
      heapu8.set(sig, this.sig72)
      heapu8.set(msg32, this.msg32)

      const ret = fns.fcrypto_secp256k1_ecdsa_recover(
        this.ctx,
        this.pubkey,
        this.sig72,
        recid,
        this.msg32,
        output.length
      )
      if (ret === 0) {
        const offset = this.pubkey
        output.set(heapu8.subarray(offset, offset + output.length), 0)
      }

      return ret
    }

    ecdh (output, pubkey, seckey) {
      try {
        heapu8.set(pubkey, this.pubkey)
        heapu8.set(seckey, this.seckey)

        const ret = fns.fcrypto_secp256k1_ecdh(
          this.ctx,
          this.hash32,
          this.pubkey,
          pubkey.length,
          this.seckey
        )
        if (ret === 0) {
          output.set(heapu8.subarray(this.hash32, this.hash32 + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.seckey)
      }
    }
  }
}
