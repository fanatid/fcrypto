module.exports = ({ fns, heapu8, heap32 }) => {
  return class Secp256k1 {
    constructor () {
      this.ctx = fns.fcrypto_secp256k1_context_create()

      // I did not find how memory allocated with malloc in WASM,
      // but it's looks like: Math.ceil((requested + 4) / 16) * 16.
      // So, instead allocating few areas, we allocate one and split by hands.
      // Maximum usage in ecdsaRecover: 65 + 64 + 32 = 161 => 176
      // In many cases below we use pointer to bigger areas for smaller things,
      // this is OK. (pubkey 65 to ptr72, tweak 32 to ptr64, etc)
      const baseptr = fns.malloc(172) // 176 - 4 = 172
      this.ptr72 = baseptr
      this.ptr64 = this.ptr72 + 72
      this.ptr32 = this.ptr64 + 64
      this.ptr4 = this.ptr32 + 32

      // For removing sensetive data
      this.z32 = new Uint8Array(32)
    }

    contextRandomize (seed) {
      if (seed === null) {
        return fns.fcrypto_secp256k1_context_randomize(this.ctx, null)
      }

      try {
        heapu8.set(seed, this.ptr32)
        return fns.fcrypto_secp256k1_context_randomize(this.ctx, this.ptr32)
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    privateKeyVerify (seckey) {
      try {
        heapu8.set(seckey, this.ptr32)
        return fns.fcrypto_secp256k1_seckey_verify(this.ctx, this.ptr32)
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    privateKeyNegate (seckey) {
      try {
        heapu8.set(seckey, this.ptr32)

        const ret = fns.fcrypto_secp256k1_seckey_negate(this.ctx, this.ptr32)
        if (ret === 0) {
          seckey.set(heapu8.subarray(this.ptr32, this.ptr32 + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    privateKeyTweakAdd (seckey, tweak) {
      try {
        heapu8.set(seckey, this.ptr32)
        heapu8.set(tweak, this.ptr64)

        const ret = fns.fcrypto_secp256k1_seckey_tweak_add(
          this.ctx,
          this.ptr32,
          this.ptr64
        )
        if (ret === 0) {
          seckey.set(heapu8.subarray(this.ptr32, this.ptr32 + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
        heapu8.set(this.z32, this.ptr64)
      }
    }

    privateKeyTweakMul (seckey, tweak) {
      try {
        heapu8.set(seckey, this.ptr32)
        heapu8.set(tweak, this.ptr64)

        const ret = fns.fcrypto_secp256k1_seckey_tweak_mul(
          this.ctx,
          this.ptr32,
          this.ptr64
        )
        if (ret === 0) {
          seckey.set(heapu8.subarray(this.ptr32, this.ptr32 + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
        heapu8.set(this.z32, this.ptr64)
      }
    }

    publicKeyCreate (output, seckey) {
      try {
        heapu8.set(seckey, this.ptr32)

        const ret = fns.fcrypto_secp256k1_pubkey_create(
          this.ctx,
          this.ptr72,
          this.ptr32,
          output.length
        )
        if (ret === 0) {
          output.set(heapu8.subarray(this.ptr72, this.ptr72 + output.length), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    publicKeyConvert (output, pubkey) {
      heapu8.set(pubkey, this.ptr72)

      const ret = fns.fcrypto_secp256k1_pubkey_convert(
        this.ctx,
        this.ptr72,
        this.ptr72,
        pubkey.length,
        output.length
      )
      if (ret === 0) {
        output.set(heapu8.subarray(this.ptr72, this.ptr72 + output.length), 0)
      }

      return ret
    }

    publicKeyNegate (output, pubkey) {
      heapu8.set(pubkey, this.ptr72)

      const ret = fns.fcrypto_secp256k1_pubkey_negate(
        this.ctx,
        this.ptr72,
        this.ptr72,
        pubkey.length,
        output.length
      )
      if (ret === 0) {
        output.set(heapu8.subarray(this.ptr72, this.ptr72 + output.length), 0)
      }

      return ret
    }

    publicKeyCombine (output, pubkeys) {
      let keys, inputs, inputslen
      try {
        let totallen = 0
        for (let i = 0; i < pubkeys.length; ++i) totallen += pubkeys[i].length

        // While wasm is 32bit, pointer size is 4
        keys = fns.malloc(totallen)
        inputs = fns.malloc(4 * pubkeys.length) / 4
        inputslen = fns.malloc(4 * pubkeys.length) / 4

        for (let i = 0; i < pubkeys.length; ++i) {
          const pubkey = pubkeys[i]
          heap32[inputs + i] = keys + pubkey.length * i
          heapu8.set(pubkey, heap32[inputs + i])
          heap32[inputslen + i] = pubkey.length
        }

        const ret = fns.fcrypto_secp256k1_pubkey_combine(
          this.ctx,
          this.ptr72,
          inputs * 4,
          inputslen * 4,
          pubkeys.length,
          output.length
        )
        if (ret === 0) {
          output.set(heapu8.subarray(this.ptr72, this.ptr72 + output.length), 0)
        }

        return ret
      } finally {
        fns.free(keys)
        fns.free(inputs * 4)
        fns.free(inputslen * 4)
      }
    }

    publicKeyTweakAdd (output, pubkey, tweak) {
      try {
        heapu8.set(pubkey, this.ptr72)
        heapu8.set(tweak, this.ptr32)

        const ret = fns.fcrypto_secp256k1_pubkey_tweak_add(
          this.ctx,
          this.ptr72,
          this.ptr72,
          pubkey.length,
          this.ptr32,
          output.length
        )
        if (ret === 0) {
          const offset = this.ptr72
          output.set(heapu8.subarray(offset, offset + output.length), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    publicKeyTweakMul (output, pubkey, tweak) {
      try {
        heapu8.set(pubkey, this.ptr72)
        heapu8.set(tweak, this.ptr32)

        const ret = fns.fcrypto_secp256k1_pubkey_tweak_mul(
          this.ctx,
          this.ptr72,
          this.ptr72,
          pubkey.length,
          this.ptr32,
          output.length
        )
        if (ret === 0) {
          output.set(heapu8.subarray(this.ptr72, this.ptr72 + output.length), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    signatureNormalize (sig) {
      heapu8.set(sig, this.ptr72)

      const ret = fns.fcrypto_secp256k1_signature_normalize(
        this.ctx,
        this.ptr72
      )
      if (ret === 0) {
        sig.set(heapu8.subarray(this.ptr72, this.ptr72 + 64), 0)
      }

      return ret
    }

    signatureExport (obj, sig) {
      heapu8.set(sig, this.ptr72)
      heap32[this.ptr4 / 4] = 72

      const ret = fns.fcrypto_secp256k1_signature_export(
        this.ctx,
        this.ptr72,
        this.ptr4,
        this.ptr72
      )
      if (ret === 0) {
        obj.outputlen = heap32[this.ptr4 / 4]
        const derSig = heapu8.subarray(this.ptr72, this.ptr72 + obj.outputlen)
        obj.output.set(derSig, 0)
      }

      return ret
    }

    signatureImport (output, sig) {
      heapu8.set(sig, this.ptr72)

      const ret = fns.fcrypto_secp256k1_signature_import(
        this.ctx,
        this.ptr72,
        this.ptr72,
        sig.length
      )
      if (ret === 0) {
        output.set(heapu8.subarray(this.ptr72, this.ptr72 + 64), 0)
      }

      return ret
    }

    ecdsaSign (obj, msg32, seckey) {
      try {
        heapu8.set(msg32, this.ptr64)
        heapu8.set(seckey, this.ptr32)

        const ret = fns.fcrypto_secp256k1_ecdsa_sign(
          this.ctx,
          this.ptr64,
          this.ptr4,
          this.ptr64,
          this.ptr32
        )
        if (ret === 0) {
          obj.signature.set(heapu8.subarray(this.ptr64, this.ptr64 + 64), 0)
          obj.recid = heap32[this.ptr4 / 4]
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }

    ecdsaVerify (sig, msg32, pubkey) {
      heapu8.set(sig, this.ptr64)
      heapu8.set(msg32, this.ptr32)
      heapu8.set(pubkey, this.ptr72)

      return fns.fcrypto_secp256k1_ecdsa_verify(
        this.ctx,
        this.ptr64,
        this.ptr32,
        this.ptr72,
        pubkey.length
      )
    }

    ecdsaRecover (output, sig, recid, msg32) {
      heapu8.set(sig, this.ptr64)
      heapu8.set(msg32, this.ptr32)

      const ret = fns.fcrypto_secp256k1_ecdsa_recover(
        this.ctx,
        this.ptr72,
        this.ptr64,
        recid,
        this.ptr32,
        output.length
      )
      if (ret === 0) {
        output.set(heapu8.subarray(this.ptr72, this.ptr72 + output.length), 0)
      }

      return ret
    }

    ecdh (output, pubkey, seckey) {
      try {
        heapu8.set(pubkey, this.ptr72)
        heapu8.set(seckey, this.ptr32)

        const ret = fns.fcrypto_secp256k1_ecdh(
          this.ctx,
          this.ptr64,
          this.ptr72,
          pubkey.length,
          this.ptr32
        )
        if (ret === 0) {
          output.set(heapu8.subarray(this.ptr64, this.ptr64 + 32), 0)
        }

        return ret
      } finally {
        heapu8.set(this.z32, this.ptr32)
      }
    }
  }
}
