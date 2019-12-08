const test = require('tape')
const { randomBytes } = require('crypto')
const fcrypto = require('../')

function createTests (type) {
  const prefix = `${type}.secp256k1`

  test(prefix, async (t) => {
    const { secp256k1 } = await fcrypto.load(type)

    // check initialization
    t.test(`${prefix}.init`, (t) => {
      const methods = ['privateKeyVerify']

      for (const method of methods) {
        t.throws(() => {
          secp256k1[method]()
        }, new RegExp('^Error: Secp256k1 should be initialized first$'))
      }

      t.end()
    })

    t.test(`${prefix}.init call`, (t) => {
      t.doesNotThrow(() => secp256k1.init())
      t.throws(
        () => secp256k1.init(),
        new RegExp('^Error: Secp256k1 already initialized$')
      )

      t.end()
    })

    t.test(`${prefix}.randomize with invalid seed`, (t) => {
      t.throws(() => {
        secp256k1.randomize(42)
      }, new RegExp('^Error: Expected seed to be Uint8Array or null$'))

      t.throws(() => {
        secp256k1.randomize(new Uint8Array(31))
      }, new RegExp('^Error: Expected seed to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.randomize`, (t) => {
      t.doesNotThrow(() => secp256k1.randomize(randomBytes(32)))
      t.doesNotThrow(() => secp256k1.randomize(null))
      t.end()
    })

    // privateKeyVerify
    t.test(`${prefix}.privateKeyVerify with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyVerify(null)
      }, new RegExp('^Error: Expected private key to be Uint8Array$'))

      t.throws(() => {
        secp256k1.privateKeyVerify(new Uint8Array(31))
      }, new RegExp('^Error: Expected private key to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.privateKeyVerify test key validity`, (t) => {
      const fixtures = [
        {
          privKey:
            '0000000000000000000000000000000000000000000000000000000000000000',
          valid: false,
        },
        {
          privKey:
            '6f2a6b8bf4b04a62ad2dc3fd22e1f2da1e0f57fc593e9198518c9ba436459f2a',
          valid: true,
        },
      ]

      for (let { privKey, valid } of fixtures) {
        privKey = Buffer.from(privKey, 'hex')
        t.same(secp256k1.privateKeyVerify(privKey), valid)
      }

      t.end()
    })

    // privateKeyNegate
    t.test(`${prefix}.privateKeyNegate with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyNegate(null)
      }, new RegExp('^Error: Expected private key to be Uint8Array$'))

      t.throws(() => {
        secp256k1.privateKeyNegate(new Uint8Array(31))
      }, new RegExp('^Error: Expected private key to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.privateKeyNegate fixtures`, (t) => {
      const fixtures = [
        {
          privKey:
            '0000000000000000000000000000000000000000000000000000000000000001',
          result:
            'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
        },
        {
          privKey:
            'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
          result:
            'fffffffffffffffffffffffffffffffd755db9cd5e9140777fa4bd19a06c8284',
        },
      ]

      for (let { privKey, result } of fixtures) {
        privKey = Buffer.from(privKey, 'hex')
        t.same(secp256k1.privateKeyNegate(privKey).toString('hex'), result)
      }

      t.end()
    })

    // privateKeyTweakAdd
    t.test(`${prefix}.privateKeyTweakAdd with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyTweakAdd(null)
      }, new RegExp('^Error: Expected private key to be Uint8Array$'))

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(new Uint8Array(31))
      }, new RegExp('^Error: Expected private key to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakAdd with invalid tweak`, (t) => {
      const pk = new Uint8Array(32)

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(pk, null)
      }, new RegExp('^Error: Expected tweak to be Uint8Array$'))

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(pk, new Uint8Array(31))
      }, new RegExp('^Error: Expected tweak to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakAdd fixtures`, (t) => {
      const fixtures = [
        {
          privKey:
            '0000000000000000000000000000000000000000000000000000000000000005',
          tweak:
            'aa72d681cedbc74f5a8c8f0c6624bd3cd8bbf9d6e64d8a3237ef5c9c00de5b30',
          result:
            'aa72d681cedbc74f5a8c8f0c6624bd3cd8bbf9d6e64d8a3237ef5c9c00de5b35',
        },
        {
          privKey:
            '0000000000000000000000000000000000000000000000000000000000000001',
          tweak:
            'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
          error:
            '^Error: The tweak was out of range or the resulted private key is invalid$',
        },
      ]

      for (let { privKey, tweak, result, error } of fixtures) {
        privKey = Buffer.from(privKey, 'hex')
        tweak = Buffer.from(tweak, 'hex')

        if (result) {
          t.same(
            secp256k1.privateKeyTweakAdd(privKey, tweak).toString('hex'),
            result
          )
        } else {
          t.throws(
            () => secp256k1.privateKeyTweakAdd(privKey, tweak),
            new RegExp(error)
          )
        }
      }

      t.end()
    })

    // privateKeyTweakMul
    t.test(`${prefix}.privateKeyTweakMul with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyTweakMul(null)
      }, new RegExp('^Error: Expected private key to be Uint8Array$'))

      t.throws(() => {
        secp256k1.privateKeyTweakMul(new Uint8Array(31))
      }, new RegExp('^Error: Expected private key to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakMul with invalid tweak`, (t) => {
      const pk = new Uint8Array(32)

      t.throws(() => {
        secp256k1.privateKeyTweakMul(pk, null)
      }, new RegExp('^Error: Expected tweak to be Uint8Array$'))

      t.throws(() => {
        secp256k1.privateKeyTweakMul(pk, new Uint8Array(31))
      }, new RegExp('^Error: Expected tweak to be Uint8Array with length 32$'))

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakMul fixtures`, (t) => {
      const fixtures = [
        {
          privKey:
            '0000000000000000000000000000000000000000000000000000000000000005',
          tweak:
            'aa72d681cedbc74f5a8c8f0c6624bd3cd8bbf9d6e64d8a3237ef5c9c00de5b30',
          result:
            '543e30890a4ae48cc4becb3dfeb7b2340b9f4a7e71a9d247d835b36593b5042d',
        },
        {
          privKey:
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          tweak:
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          error: '^Error: The tweak was out of range or equal to zero$',
        },
      ]

      for (let { privKey, tweak, result, error } of fixtures) {
        privKey = Buffer.from(privKey, 'hex')
        tweak = Buffer.from(tweak, 'hex')

        if (result) {
          t.same(
            secp256k1.privateKeyTweakMul(privKey, tweak).toString('hex'),
            result
          )
        } else {
          t.throws(
            () => secp256k1.privateKeyTweakMul(privKey, tweak),
            new RegExp(error)
          )
        }
      }

      t.end()
    })

    // publicKeyCreate
    // publicKeyConvert
    // publicKeyNegate
    // publicKeyCombine
    // publicKeyTweakAdd
    // publicKeyTweakMul
    // signatureNormalize
    // signatureExport
    // signatureImport
    // ecdsaSign
    // ecdsaVerify
    // ecdsaRecover
    // ecdh
    // ecdhUnsafe

    t.end()
  })
}

if (!process.browser) createTests('addon')
createTests('wasm')
