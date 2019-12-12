const assert = require('./assert')

function getAssertedOutput (output = (len) => new Uint8Array(len), length) {
  if (typeof output === 'function') output = output(length)
  assert.isUint8Array('output', output, length)
  return output
}

const errors = {
  ALREADY_INITIALIZED: 'Secp256k1 already initialized',
  SHOULD_BE_INITIALIZED: 'Secp256k1 should be initialized first',
  IMPOSSIBLE_CASE: 'Impossible case. Please create issue.',
  TWEAK_ADD:
    'The tweak was out of range or the resulted private key is invalid',
  TWEAK_MUL: 'The tweak was out of range or equal to zero',
  CONTEXT_RANDOMIZE_UNKNOW: 'Unknow error on context randomization',
  SECKEY_INVALID: 'Private Key is invalid',
  PUBKEY_PARSE: 'Public Key could not be parsed',
  PUBKEY_SERIALIZE: 'Public Key serialization error',
  PUBKEY_COMBINE: 'The sum of the public keys is not valid',
}

module.exports = (Secp256k1) => {
  let instance = null

  return {
    init () {
      assert(instance === null, errors.ALREADY_INITIALIZED)
      instance = new Secp256k1()
    },

    contextRandomize (seed) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert(
        seed === null || seed instanceof Uint8Array,
        'Expected seed to be Uint8Array or null'
      )
      if (seed !== null) assert.isUint8Array('seed', seed, 32)

      switch (instance.contextRandomize(seed)) {
        case 1:
          throw new Error(errors.CONTEXT_RANDOMIZE_UNKNOW)
      }
    },

    privateKeyVerify (seckey) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('private key', seckey, 32)

      return instance.privateKeyVerify(seckey) === 0
    },

    privateKeyNegate (seckey) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('private key', seckey, 32)

      switch (instance.privateKeyNegate(seckey)) {
        case 0:
          return seckey
        case 1:
          throw new Error(errors.IMPOSSIBLE_CASE)
      }
    },

    privateKeyTweakAdd (seckey, tweak) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('private key', seckey, 32)
      assert.isUint8Array('tweak', tweak, 32)

      switch (instance.privateKeyTweakAdd(seckey, tweak)) {
        case 0:
          return seckey
        case 1:
          throw new Error(errors.TWEAK_ADD)
      }
    },

    privateKeyTweakMul (seckey, tweak) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('private key', seckey, 32)
      assert.isUint8Array('tweak', tweak, 32)

      switch (instance.privateKeyTweakMul(seckey, tweak)) {
        case 0:
          return seckey
        case 1:
          throw new Error(errors.TWEAK_MUL)
      }
    },

    publicKeyCreate (seckey, compressed = true, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('private key', seckey, 32)
      output = getAssertedOutput(output, compressed ? 33 : 65)

      switch (instance.publicKeyCreate(output, seckey)) {
        case 0:
          return output
        case 1:
          throw new Error(errors.SECKEY_INVALID)
        case 2:
          throw new Error(errors.PUBKEY_SERIALIZE)
      }
    },

    publicKeyConvert (pubkey, compressed = true, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('public key', pubkey, [33, 65])
      output = getAssertedOutput(output, compressed ? 33 : 65)

      switch (instance.publicKeyConvert(output, pubkey)) {
        case 0:
          return output
        case 1:
          throw new Error(errors.PUBKEY_PARSE)
        case 2:
          throw new Error(errors.PUBKEY_SERIALIZE)
      }
    },

    publicKeyNegate (pubkey, compressed = true, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('public key', pubkey, [33, 65])
      output = getAssertedOutput(output, compressed ? 33 : 65)

      switch (instance.publicKeyNegate(output, pubkey)) {
        case 0:
          return output
        case 1:
          throw new Error(errors.PUBKEY_PARSE)
        case 2:
          throw new Error(errors.IMPOSSIBLE_CASE)
        case 3:
          throw new Error(errors.PUBKEY_SERIALIZE)
      }
    },

    publicKeyCombine (pubkeys, compressed = true, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert(Array.isArray(pubkeys), `Expected public keys to be an Array`)
      for (const pubkey of pubkeys) {
        assert.isUint8Array('public key', pubkey, [33, 65])
      }
      output = getAssertedOutput(output, compressed ? 33 : 65)

      switch (instance.publicKeyCombine(output, pubkeys)) {
        case 0:
          return output
        case 1:
          throw new Error(errors.PUBKEY_PARSE)
        case 2:
          throw new Error(errors.PUBKEY_COMBINE)
        case 3:
          throw new Error(errors.PUBKEY_SERIALIZE)
      }
    },

    publicKeyTweakAdd (pubkey, tweak, compressed = true, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('public key', pubkey, [33, 65])
      assert.isUint8Array('tweak', tweak, 32)
      output = getAssertedOutput(output, compressed ? 33 : 65)

      switch (instance.publicKeyTweakAdd(output, pubkey, tweak)) {
        case 0:
          return output
        case 1:
          throw new Error(errors.PUBKEY_PARSE)
        case 2:
          throw new Error(errors.TWEAK_ADD)
      }
    },

    publicKeyTweakMul (pubkey, tweak, compressed = true, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('public key', pubkey, [33, 65])
      assert.isUint8Array('tweak', tweak, 32)
      output = getAssertedOutput(output, compressed ? 33 : 65)

      switch (instance.publicKeyTweakAdd(output, pubkey, tweak)) {
        case 0:
          return output
        case 1:
          throw new Error(errors.PUBKEY_PARSE)
        case 2:
          throw new Error(errors.TWEAK_MUL)
      }
    },

    // todo

    ecdsaSign (msg32, seckey, output) {
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)
      assert.isUint8Array('message', msg32, 32)
      assert.isUint8Array('private key', seckey, 32)
      output = getAssertedOutput(output, 64)

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
      assert(instance !== null, errors.SHOULD_BE_INITIALIZED)

      switch (instance.ecdsaVerify(signagure, msg32, pubkey)) {
        case 0:
          return true
        case 1:
          throw new Error('Signature could not be parsed')
        case 2:
          throw new Error(errors.PUBKEY_PARSE)
        case 3:
          throw new Error('Incorrect or unparseable signature')
      }
    },
  }
}
