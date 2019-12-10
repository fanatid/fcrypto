const { assert } = require('./util')

module.exports = (Secp256k1) => {
  let instance = null

  return {
    init () {
      assert(instance === null, 'Secp256k1 already initialized')
      instance = new Secp256k1()
    },

    contextRandomize (seed) {
      assert(instance !== null, 'Secp256k1 should be initialized first')
      assert(
        seed === null || seed instanceof Uint8Array,
        'Expected seed to be Uint8Array or null'
      )
      if (seed !== null) assert.isUint8Array('seed', seed, 32)

      switch (instance.contextRandomize(seed)) {
        case 1:
          throw new Error('Unknow error on context randomization')
      }
    },

    privateKeyVerify (seckey) {
      assert(instance !== null, 'Secp256k1 should be initialized first')
      assert.isUint8Array('private key', seckey, 32)

      return instance.privateKeyVerify(seckey) === 0
    },

    privateKeyNegate (seckey) {
      assert(instance !== null, 'Secp256k1 should be initialized first')
      assert.isUint8Array('private key', seckey, 32)

      switch (instance.privateKeyNegate(seckey)) {
        case 0:
          return seckey
        case 1:
          throw new Error(
            'Congratulations! You found a key for impossible case. Please create issue.'
          )
      }
    },

    privateKeyTweakAdd (seckey, tweak) {
      assert(instance !== null, 'Secp256k1 should be initialized first')
      assert.isUint8Array('private key', seckey, 32)
      assert.isUint8Array('tweak', tweak, 32)

      switch (instance.privateKeyTweakAdd(seckey, tweak)) {
        case 0:
          return seckey
        case 1:
          throw new Error(
            'The tweak was out of range or the resulted private key is invalid'
          )
      }
    },

    privateKeyTweakMul (seckey, tweak) {
      assert(instance !== null, 'Secp256k1 should be initialized first')
      assert.isUint8Array('private key', seckey, 32)
      assert.isUint8Array('tweak', tweak, 32)

      switch (instance.privateKeyTweakMul(seckey, tweak)) {
        case 0:
          return seckey
        case 1:
          throw new Error('The tweak was out of range or equal to zero')
      }
    },

    publicKeyCreate (
      seckey,
      compressed = true,
      output = (len) => new Uint8Array(len)
    ) {
      assert(instance !== null, 'Secp256k1 should be initialized first')

      const outputlen = compressed ? 33 : 65
      if (typeof output === 'function') output = output(outputlen)

      switch (instance.publicKeyCreate(output, seckey, outputlen)) {
        case 0:
          return output
        case 1:
          throw new Error('Private Key is invalid')
        case 2:
          throw new Error('Public Key serialization error')
      }
    },

    ecdsaSign (msg32, seckey, output = (len) => new Uint8Array(len)) {
      assert(instance !== null, 'Secp256k1 should be initialized first')

      if (typeof output === 'function') output = output(64)

      const sig = { signature: output, recid: null }
      switch (instance.ecdsaSign(sig, msg32, seckey)) {
        case 0:
          return sig
        case 1:
          throw new Error(
            'The nonce generation function failed, or the private key was invalid'
          )
      }
    },

    ecdsaVerify (signagure, msg32, pubkey) {
      assert(instance !== null, 'Secp256k1 should be initialized first')

      switch (instance.ecdsaVerify(signagure, msg32, pubkey)) {
        case 0:
          return true
        case 1:
          throw new Error('Signature could not be parsed')
        case 2:
          throw new Error('The public key could not be parsed')
        case 3:
          throw new Error('Incorrect or unparseable signature')
      }
    },
  }
}
