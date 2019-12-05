module.exports = async () => {
  const code = await require('./bin')
  const { heapu8, importObject, exportMap } = require('./glue')

  const { module, instance } = await WebAssembly.instantiate(code, importObject)
  const { exports: fns } = instance

  const malloc = (size) => fns[exportMap.malloc](size)
  const free = (ptr) => fns[exportMap.free](ptr)

  const ctx = fns[exportMap.fcrypto_secp256k1_context_create]()
  const ptr64 = malloc(64)
  const ptr4 = malloc(4)
  const ptr32_1 = malloc(32)
  const ptr32_2 = malloc(32)
  const ptr33 = malloc(33)

  return {
    publicKeyCreate (pubkey, seckey) {
      heapu8.set(seckey, ptr32_1)
      const ret = fns[exportMap.fcrypto_secp256k1_pubkey_create](ctx, ptr33, ptr32_1, 1)
      pubkey.set(heapu8.subarray(ptr33, ptr33 + 33), 0)
      return ret
    },

    ecdsaSign (sig, msg32, seckey) {
      heapu8.set(msg32, ptr32_1)
      heapu8.set(seckey, ptr32_2)

      const ret = fns[exportMap.fcrypto_secp256k1_ecdsa_sign](ctx, ptr64, ptr4, ptr32_1, ptr32_2)
      if (ret !== 0) throw new Error(`sign return code ${ret}`)

      sig.recid = heapu8[ptr4]
      sig.signature.set(heapu8.subarray(ptr64, ptr64 + 64), 0)

      return ret
    },

    ecdsaVerify (sig, msg32, pubkey) {
      heapu8.set(sig, ptr64)
      heapu8.set(msg32, ptr32_1)
      heapu8.set(pubkey, ptr33)
      return fns[exportMap.fcrypto_secp256k1_ecdsa_verify](ctx, ptr64, ptr32_1, ptr33, pubkey.length)
    }
  }
}
