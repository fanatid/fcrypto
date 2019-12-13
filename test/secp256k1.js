const test = require('tape')
const { randomBytes } = require('crypto')
const fcrypto = require('../')
const { getAvailableTypes } = require('./util')

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
        }, /^Error: Secp256k1 should be initialized first$/)
      }

      t.end()
    })

    t.test(`${prefix}.init call`, (t) => {
      t.doesNotThrow(() => secp256k1.init())
      t.throws(() => secp256k1.init(), /^Error: Secp256k1 already initialized$/)

      t.end()
    })

    // contextRandomize
    t.test(`${prefix}.contextRandomize with invalid seed`, (t) => {
      t.throws(() => {
        secp256k1.contextRandomize(42)
      }, /^Error: Expected seed to be Uint8Array or null$/)

      t.throws(() => {
        secp256k1.contextRandomize(new Uint8Array(42))
      }, /^Error: Expected seed to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.contextRandomize`, (t) => {
      t.doesNotThrow(() => secp256k1.contextRandomize(randomBytes(32)))
      t.doesNotThrow(() => secp256k1.contextRandomize(null))
      t.end()
    })

    // privateKeyVerify
    t.test(`${prefix}.privateKeyVerify with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyVerify(null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyVerify(new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyVerify test key validity`, (t) => {
      const fixtures = [
        {
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000000',
          valid: false,
        },
        {
          seckey:
            '6f2a6b8bf4b04a62ad2dc3fd22e1f2da1e0f57fc593e9198518c9ba436459f2a',
          valid: true,
        },
      ]

      for (let { seckey, valid } of fixtures) {
        seckey = Buffer.from(seckey, 'hex')
        t.same(secp256k1.privateKeyVerify(seckey), valid)
      }

      t.end()
    })

    // privateKeyNegate
    t.test(`${prefix}.privateKeyNegate with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyNegate(null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyNegate(new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyNegate fixtures`, (t) => {
      const fixtures = [
        {
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000001',
          result:
            'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
        },
        {
          seckey:
            'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
          result:
            'fffffffffffffffffffffffffffffffd755db9cd5e9140777fa4bd19a06c8284',
        },
      ]

      for (let { seckey, result } of fixtures) {
        seckey = Buffer.from(seckey, 'hex')
        t.same(secp256k1.privateKeyNegate(seckey).toString('hex'), result)
      }

      t.end()
    })

    // privateKeyTweakAdd
    t.test(`${prefix}.privateKeyTweakAdd with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyTweakAdd(null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakAdd with invalid tweak`, (t) => {
      const pk = new Uint8Array(32)

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(pk, null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(pk, new Uint8Array(42))
      }, /^Error: Expected tweak to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakAdd fixtures`, (t) => {
      const fixtures = [
        {
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000005',
          tweak:
            'aa72d681cedbc74f5a8c8f0c6624bd3cd8bbf9d6e64d8a3237ef5c9c00de5b30',
          result:
            'aa72d681cedbc74f5a8c8f0c6624bd3cd8bbf9d6e64d8a3237ef5c9c00de5b35',
        },
        {
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000001',
          tweak:
            'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
          error: /^Error: The tweak was out of range or the resulted private key is invalid$/,
        },
      ]

      for (let { seckey, tweak, result, error } of fixtures) {
        seckey = Buffer.from(seckey, 'hex')
        tweak = Buffer.from(tweak, 'hex')

        if (result) {
          t.same(
            secp256k1.privateKeyTweakAdd(seckey, tweak).toString('hex'),
            result
          )
        } else {
          t.throws(() => secp256k1.privateKeyTweakAdd(seckey, tweak), error)
        }
      }

      t.end()
    })

    // privateKeyTweakMul
    t.test(`${prefix}.privateKeyTweakMul with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.privateKeyTweakMul(null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyTweakMul(new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakMul with invalid tweak`, (t) => {
      const pk = new Uint8Array(32)

      t.throws(() => {
        secp256k1.privateKeyTweakMul(pk, null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyTweakMul(pk, new Uint8Array(42))
      }, /^Error: Expected tweak to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakMul fixtures`, (t) => {
      const fixtures = [
        {
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000005',
          tweak:
            'aa72d681cedbc74f5a8c8f0c6624bd3cd8bbf9d6e64d8a3237ef5c9c00de5b30',
          result:
            '543e30890a4ae48cc4becb3dfeb7b2340b9f4a7e71a9d247d835b36593b5042d',
        },
        {
          seckey:
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          tweak:
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          error: /^Error: The tweak was out of range or equal to zero$/,
        },
      ]

      for (let { seckey, tweak, result, error } of fixtures) {
        seckey = Buffer.from(seckey, 'hex')
        tweak = Buffer.from(tweak, 'hex')

        if (result) {
          t.same(
            secp256k1.privateKeyTweakMul(seckey, tweak).toString('hex'),
            result
          )
        } else {
          t.throws(() => secp256k1.privateKeyTweakMul(seckey, tweak), error)
        }
      }

      t.end()
    })

    // publicKeyCreate
    t.test(`${prefix}.publicKeyCreate with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyCreate(null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyCreate(new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyCreate with invalid output`, (t) => {
      const seckey = new Uint8Array(32)

      t.throws(() => {
        secp256k1.publicKeyCreate(seckey, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyCreate(seckey, true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyCreate(seckey, false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyCreate with output as function`, (t) => {
      const seckey = Buffer.alloc(32, 0x01)

      t.plan(2)

      secp256k1.publicKeyCreate(seckey, true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.publicKeyCreate(seckey, false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.publicKeyCreate fixtures`, (t) => {
      const fixtures = [
        {
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000005',
          pubkey33:
            '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
          pubkey65:
            '042f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6',
        },
      ]

      for (let { seckey, pubkey33, pubkey65 } of fixtures) {
        seckey = Buffer.from(seckey, 'hex')
        const r33 = secp256k1.publicKeyCreate(seckey, true, Buffer.alloc)
        t.same(r33.toString('hex'), pubkey33)
        const r65 = secp256k1.publicKeyCreate(seckey, false, Buffer.alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // publicKeyConvert
    t.test(`${prefix}.publicKeyConvert with invalid public key`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyConvert(null)
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyConvert(new Uint8Array(42))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyConvert with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)

      t.throws(() => {
        secp256k1.publicKeyConvert(pubkey, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyConvert(pubkey, true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyConvert(pubkey, false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyConvert with output as function`, (t) => {
      const pubkey = new Uint8Array(33).fill(0x02)

      t.plan(2)

      secp256k1.publicKeyConvert(pubkey, true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.publicKeyConvert(pubkey, false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.publicKeyConvert fixtures`, (t) => {
      const fixtures = [
        {
          pubkey33:
            '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
          pubkey65:
            '042f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6',
        },
      ]

      for (const { pubkey33, pubkey65 } of fixtures) {
        const b65 = Buffer.from(pubkey65, 'hex')
        const r33 = secp256k1.publicKeyConvert(b65, true, Buffer.alloc)
        t.same(r33.toString('hex'), pubkey33)

        const b33 = Buffer.from(pubkey33, 'hex')
        const r65 = secp256k1.publicKeyConvert(b33, false, Buffer.alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // publicKeyNegate
    t.test(`${prefix}.publicKeyNegate with invalid public key`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyNegate(null)
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyNegate(new Uint8Array(42))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyNegate with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)

      t.throws(() => {
        secp256k1.publicKeyNegate(pubkey, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyNegate(pubkey, true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyNegate(pubkey, false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyNegate with output as function`, (t) => {
      const pubkey = new Uint8Array(33).fill(0x02)

      t.plan(2)

      secp256k1.publicKeyNegate(pubkey, true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.publicKeyNegate(pubkey, false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.publicKeyNegate fixtures`, (t) => {
      const fixtures = [
        {
          pubkey:
            '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
          pubkey33:
            '032f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
          pubkey65:
            '042f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe42753ddd9c91a1c292b24562259363bd90877d8e454f297bf235782c459539959',
        },
      ]

      for (let { pubkey, pubkey33, pubkey65 } of fixtures) {
        pubkey = Buffer.from(pubkey, 'hex')
        const r33 = secp256k1.publicKeyNegate(pubkey, true, Buffer.alloc)
        t.same(r33.toString('hex'), pubkey33)
        const r65 = secp256k1.publicKeyNegate(pubkey, false, Buffer.alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // publicKeyCombine
    t.test(`${prefix}.publicKeyCombine with invalid public key`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyCombine(null)
      }, /^Error: Expected public keys to be an Array$/)

      t.throws(() => {
        secp256k1.publicKeyCombine([null])
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyCombine([new Uint8Array(42)])
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyCombine with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)

      t.throws(() => {
        secp256k1.publicKeyCombine([pubkey], true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyCombine([pubkey], true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyCombine([pubkey], false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyCombine with output as function`, (t) => {
      const pubkey = new Uint8Array(33).fill(0x02)

      t.plan(2)

      secp256k1.publicKeyCombine([pubkey], true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.publicKeyCombine([pubkey], false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.publicKeyCombine fixtures`, (t) => {
      const fixtures = [
        {
          pubkeys: [
            '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
            '02c6c41688ca2f31f4bc9ab04232eec4d2cf5e4b08c9c54dfaf0a43a0f413ef471',
          ],
          pubkey33:
            '029d8eda9353e2ef5d402b0e89e2742586beb4771c121389e290cfcce2eb776078',
          pubkey65:
            '049d8eda9353e2ef5d402b0e89e2742586beb4771c121389e290cfcce2eb776078354f0ebd15150c23d542943a170dcda012a47b12365674d9de284169cca4ae36',
        },
      ]

      for (let { pubkeys, pubkey33, pubkey65 } of fixtures) {
        pubkeys = pubkeys.map((pubkey) => Buffer.from(pubkey, 'hex'))
        const r33 = secp256k1.publicKeyCombine(pubkeys, true, Buffer.alloc)
        t.same(r33.toString('hex'), pubkey33)
        const r65 = secp256k1.publicKeyCombine(pubkeys, false, Buffer.alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // publicKeyTweakAdd
    t.test(`${prefix}.publicKeyTweakAdd with invalid public key`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyTweakAdd(null)
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(new Uint8Array(42))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakAdd with invalid tweak`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyTweakAdd(new Uint8Array(33), null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(new Uint8Array(33), new Uint8Array(42))
      }, /^Error: Expected tweak to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakAdd with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)
      const tweak = new Uint8Array(32)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(pubkey, tweak, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(pubkey, tweak, true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(pubkey, tweak, false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakAdd with output as function`, (t) => {
      const pubkey = new Uint8Array(33).fill(0x02)
      const tweak = new Uint8Array(32)

      t.plan(2)

      secp256k1.publicKeyTweakAdd(pubkey, tweak, true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.publicKeyTweakAdd(pubkey, tweak, false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakAdd fixtures`, (t) => {
      const fixtures = [
        {
          pubkey:
            '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
          tweak:
            '0000000000000000000000000000000000000000000000000000000000000042',
          pubkey33:
            '02290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba',
          pubkey65:
            '04290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fbae38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a',
        },
      ]

      const { alloc } = Buffer
      for (let { pubkey, tweak, pubkey33, pubkey65 } of fixtures) {
        pubkey = Buffer.from(pubkey, 'hex')
        tweak = Buffer.from(tweak, 'hex')
        const r33 = secp256k1.publicKeyTweakAdd(pubkey, tweak, true, alloc)
        t.same(r33.toString('hex'), pubkey33)
        const r65 = secp256k1.publicKeyTweakAdd(pubkey, tweak, false, alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // publicKeyTweakMul
    t.test(`${prefix}.publicKeyTweakMul with invalid public key`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyTweakMul(null)
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(new Uint8Array(42))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakMul with invalid tweak`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyTweakMul(new Uint8Array(33), null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(new Uint8Array(33), new Uint8Array(42))
      }, /^Error: Expected tweak to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakMul with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)
      const tweak = new Uint8Array(32)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(pubkey, tweak, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(pubkey, tweak, true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(pubkey, tweak, false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakMul with output as function`, (t) => {
      const pubkey = new Uint8Array(33).fill(0x02)
      const tweak = new Uint8Array(32)

      t.plan(2)

      secp256k1.publicKeyTweakMul(pubkey, tweak, true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.publicKeyTweakMul(pubkey, tweak, false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakMul fixtures`, (t) => {
      const fixtures = [
        {
          pubkey:
            '022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
          tweak:
            '0000000000000000000000000000000000000000000000000000000000000042',
          pubkey33:
            '02290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba',
          pubkey65:
            '04290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fbae38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a',
        },
      ]

      const { alloc } = Buffer
      for (let { pubkey, tweak, pubkey33, pubkey65 } of fixtures) {
        pubkey = Buffer.from(pubkey, 'hex')
        tweak = Buffer.from(tweak, 'hex')
        const r33 = secp256k1.publicKeyTweakMul(pubkey, tweak, true, alloc)
        t.same(r33.toString('hex'), pubkey33)
        const r65 = secp256k1.publicKeyTweakMul(pubkey, tweak, false, alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // signatureNormalize
    t.test(`${prefix}.signatureNormalize with invalid signature`, (t) => {
      t.throws(() => {
        secp256k1.signatureNormalize(null)
      }, /^Error: Expected signature to be Uint8Array$/)

      t.throws(() => {
        secp256k1.signatureNormalize(new Uint8Array(42))
      }, /^Error: Expected signature to be Uint8Array with length 64$/)

      t.end()
    })

    t.test(`${prefix}.signatureNormalize fixtures`, (t) => {
      const fixtures = [
        {
          sig:
            'e82a8acee2089e5e5aa61e75b45c45b24a46b270261a2b27e947768a4dc62d687b3e8ff7b41057c728078934aaf433479ec892eae19177e0a8b7c4ff70b95028',
          normalized:
            'e82a8acee2089e5e5aa61e75b45c45b24a46b270261a2b27e947768a4dc62d687b3e8ff7b41057c728078934aaf433479ec892eae19177e0a8b7c4ff70b95028',
        },
        {
          sig:
            '00000000000000000000000000000000000000000000000000000000000000017fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1',
          normalized:
            '00000000000000000000000000000000000000000000000000000000000000017fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0',
        },
      ]

      for (const { sig, normalized } of fixtures) {
        const result = secp256k1.signatureNormalize(Buffer.from(sig, 'hex'))
        t.same(result.toString('hex'), normalized)
      }

      t.end()
    })

    // signatureExport
    t.test(`${prefix}.signatureExport with invalid signature`, (t) => {
      t.throws(() => {
        secp256k1.signatureExport(null)
      }, /^Error: Expected signature to be Uint8Array$/)

      t.throws(() => {
        secp256k1.signatureExport(new Uint8Array(42))
      }, /^Error: Expected signature to be Uint8Array with length 64$/)

      t.end()
    })

    t.test(`${prefix}.signatureExport with invalid output`, (t) => {
      t.throws(() => {
        secp256k1.signatureExport(new Uint8Array(64), null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.signatureExport(new Uint8Array(64), new Uint8Array(71))
      }, /^Error: Expected output to be Uint8Array with length 72$/)

      t.end()
    })

    t.test(`${prefix}.signatureExport with output as function`, (t) => {
      t.plan(1)

      secp256k1.signatureExport(new Uint8Array(64), (len) => {
        t.same(len, 72)
        return new Uint8Array(72)
      })

      t.end()
    })

    t.test(`${prefix}.signatureExport fixtures`, (t) => {
      const fixtures = [
        {
          sig:
            '00000000000000000000000000000000000000000000000000000000000000017fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1',
          der:
            '302502010102207fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1',
        },
        {
          sig:
            'bbc78e87ec3e9bfd80c28d5ba5517466538052ee20821d9303a4b9fd3689d2a0810006e42abf249ec9b8043a8453ab0b84cc3a274e48bb06b8b1fc9b87f540af',
          der:
            '3046022100bbc78e87ec3e9bfd80c28d5ba5517466538052ee20821d9303a4b9fd3689d2a0022100810006e42abf249ec9b8043a8453ab0b84cc3a274e48bb06b8b1fc9b87f540af',
        },
      ]

      for (let { sig, der } of fixtures) {
        sig = Buffer.from(sig, 'hex')
        const result = secp256k1.signatureExport(sig, Buffer.alloc)
        t.same(result.toString('hex'), der)
      }

      t.end()
    })

    // signatureImport
    t.test(`${prefix}.signatureImport with invalid signature`, (t) => {
      t.throws(() => {
        secp256k1.signatureImport(null)
      }, /^Error: Expected signature to be Uint8Array$/)

      t.end()
    })

    t.test(`${prefix}.signatureImport with invalid output`, (t) => {
      const sig = Buffer.from('3006020101020101', 'hex')

      t.throws(() => {
        secp256k1.signatureImport(sig, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.signatureImport(sig, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 64$/)

      t.end()
    })

    t.test(`${prefix}.signatureImport with output as function`, (t) => {
      t.plan(1)

      const sig = Buffer.from('3006020101020101', 'hex')
      secp256k1.signatureImport(sig, (len) => {
        t.same(len, 64)
        return new Uint8Array(64)
      })

      t.end()
    })

    t.test(`${prefix}.signatureImport fixtures`, (t) => {
      const fixtures = [
        {
          sig:
            '00000000000000000000000000000000000000000000000000000000000000017fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1',
          der:
            '302502010102207fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1',
        },
        {
          sig:
            'bbc78e87ec3e9bfd80c28d5ba5517466538052ee20821d9303a4b9fd3689d2a0810006e42abf249ec9b8043a8453ab0b84cc3a274e48bb06b8b1fc9b87f540af',
          der:
            '3046022100bbc78e87ec3e9bfd80c28d5ba5517466538052ee20821d9303a4b9fd3689d2a0022100810006e42abf249ec9b8043a8453ab0b84cc3a274e48bb06b8b1fc9b87f540af',
        },
      ]

      for (let { sig, der } of fixtures) {
        der = Buffer.from(der, 'hex')
        const result = secp256k1.signatureImport(der, Buffer.alloc)
        t.same(result.toString('hex'), sig)
      }

      t.end()
    })

    // ecdsaSign
    t.test(`${prefix}.ecdsaSign with invalid message`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaSign(null)
      }, /^Error: Expected message to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaSign(new Uint8Array(42))
      }, /^Error: Expected message to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaSign with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaSign(new Uint8Array(32), null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaSign(new Uint8Array(32), new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaSign with invalid output`, (t) => {
      const msg32 = new Uint8Array(32)
      const seckey = new Uint8Array(32)

      t.throws(() => {
        secp256k1.ecdsaSign(msg32, seckey, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaSign(msg32, seckey, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 64$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaSign with output as function`, (t) => {
      const seckey = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000001',
        'hex'
      )

      t.plan(1)

      secp256k1.ecdsaSign(new Uint8Array(32), seckey, (len) => {
        t.same(len, 64)
        return new Uint8Array(64)
      })

      t.end()
    })

    t.test(`${prefix}.ecdsaSign fixtures`, (t) => {
      const fixtures = [
        {
          msg32:
            '0000000000000000000000000000000000000000000000000000000000000000',
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000001',
          sig:
            'a0b37f8fba683cc68f6574cd43b39f0343a50008bf6ccea9d13231d9e7e2e1e411edc8d307254296264aebfc3dc76cd8b668373a072fd64665b50000e9fcce52',
          recid: 1,
        },
      ]

      for (let { msg32, seckey, sig, recid } of fixtures) {
        msg32 = Buffer.from(msg32, 'hex')
        seckey = Buffer.from(seckey, 'hex')
        const obj = secp256k1.ecdsaSign(msg32, seckey, Buffer.alloc)
        t.same(obj.signature.toString('hex'), sig)
        t.same(obj.recid, recid)
      }

      t.end()
    })

    // ecdsaVerify
    t.test(`${prefix}.ecdsaVerify with invalid signature`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaVerify(null)
      }, /^Error: Expected signature to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaVerify(new Uint8Array(42))
      }, /^Error: Expected signature to be Uint8Array with length 64$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaVerify with invalid message`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaVerify(new Uint8Array(64), null)
      }, /^Error: Expected message to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaVerify(new Uint8Array(64), new Uint8Array(42))
      }, /^Error: Expected message to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaVerify with invalid public key`, (t) => {
      const sig = new Uint8Array(64)
      const msg32 = new Uint8Array(32)

      t.throws(() => {
        secp256k1.ecdsaVerify(sig, msg32, null)
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaVerify(sig, msg32, new Uint8Array(42))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaVerify with fixtures`, (t) => {
      const fixtures = [
        {
          sig:
            'a0b37f8fba683cc68f6574cd43b39f0343a50008bf6ccea9d13231d9e7e2e1e411edc8d307254296264aebfc3dc76cd8b668373a072fd64665b50000e9fcce52',
          msg32:
            '0000000000000000000000000000000000000000000000000000000000000000',
          pubkey:
            '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
          result: true,
        },
        {
          sig:
            'a0b37f8fba683cc68f6574cd43b39f0343a50008bf6ccea9d13231d9e7e2e1e411edc8d307254296264aebfc3dc76cd8b668373a072fd64665b50000e9fcce52',
          msg32:
            '0000000000000000000000000000000000000000000000000000000000000001',
          pubkey:
            '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
          result: false,
        },
      ]

      for (let { sig, msg32, pubkey, result } of fixtures) {
        sig = Buffer.from(sig, 'hex')
        msg32 = Buffer.from(msg32, 'hex')
        pubkey = Buffer.from(pubkey, 'hex')
        const r = secp256k1.ecdsaVerify(sig, msg32, pubkey)
        t.same(r, result)
      }

      t.end()
    })

    // ecdsaRecover
    t.test(`${prefix}.ecdsaRecover with invalid signature`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaRecover(null)
      }, /^Error: Expected signature to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaRecover(new Uint8Array(42))
      }, /^Error: Expected signature to be Uint8Array with length 64$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaRecover with invalid recovery id`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaRecover(new Uint8Array(64), null)
      }, /^Error: Expected recovery id to be a Number within interval \[0, 3]$/)

      t.throws(() => {
        secp256k1.ecdsaRecover(new Uint8Array(64), 5)
      }, /^Error: Expected recovery id to be a Number within interval \[0, 3]$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaRecover with invalid message`, (t) => {
      t.throws(() => {
        secp256k1.ecdsaRecover(new Uint8Array(64), 0, null)
      }, /^Error: Expected message to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaRecover(new Uint8Array(64), 0, new Uint8Array(42))
      }, /^Error: Expected message to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaRecover with invalid output`, (t) => {
      const sig = new Uint8Array(64)
      const msg32 = new Uint8Array(32)

      t.throws(() => {
        secp256k1.ecdsaRecover(sig, 0, msg32, undefined, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdsaRecover(sig, 0, msg32, true, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.ecdsaRecover(sig, 0, msg32, false, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 65$/)

      t.end()
    })

    t.test(`${prefix}.ecdsaRecover with output as function`, (t) => {
      const sig = Buffer.from(
        'a0b37f8fba683cc68f6574cd43b39f0343a50008bf6ccea9d13231d9e7e2e1e411edc8d307254296264aebfc3dc76cd8b668373a072fd64665b50000e9fcce52',
        'hex'
      )
      const recid = 1
      const msg32 = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      )

      t.plan(2)

      secp256k1.ecdsaRecover(sig, recid, msg32, true, (len) => {
        t.same(len, 33)
        return new Uint8Array(33)
      })

      secp256k1.ecdsaRecover(sig, recid, msg32, false, (len) => {
        t.same(len, 65)
        return new Uint8Array(65)
      })

      t.end()
    })

    t.test(`${prefix}.ecdsaRecover fixtures`, (t) => {
      const fixtures = [
        {
          sig:
            'a0b37f8fba683cc68f6574cd43b39f0343a50008bf6ccea9d13231d9e7e2e1e411edc8d307254296264aebfc3dc76cd8b668373a072fd64665b50000e9fcce52',
          recid: 1,
          msg32:
            '0000000000000000000000000000000000000000000000000000000000000000',
          pubkey33:
            '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
          pubkey65:
            '0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
        },
      ]

      const { alloc } = Buffer
      for (let { sig, recid, msg32, pubkey33, pubkey65 } of fixtures) {
        sig = Buffer.from(sig, 'hex')
        msg32 = Buffer.from(msg32, 'hex')
        const r33 = secp256k1.ecdsaRecover(sig, recid, msg32, true, alloc)
        t.same(r33.toString('hex'), pubkey33)
        const r65 = secp256k1.ecdsaRecover(sig, recid, msg32, false, alloc)
        t.same(r65.toString('hex'), pubkey65)
      }

      t.end()
    })

    // ecdh
    t.test(`${prefix}.ecdh with invalid public key`, (t) => {
      t.throws(() => {
        secp256k1.ecdh(null)
      }, /^Error: Expected public key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdh(new Uint8Array(42))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.ecdh with invalid private key`, (t) => {
      t.throws(() => {
        secp256k1.ecdh(new Uint8Array(33), null)
      }, /^Error: Expected private key to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdh(new Uint8Array(33), new Uint8Array(42))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.ecdh with invalid output`, (t) => {
      const pubkey = Buffer.from(
        '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        'hex'
      )
      const seckey = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000001',
        'hex'
      )

      t.throws(() => {
        secp256k1.ecdh(pubkey, seckey, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.ecdh(pubkey, seckey, new Uint8Array(42))
      }, /^Error: Expected output to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.ecdh with output as function`, (t) => {
      const pubkey = Buffer.from(
        '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        'hex'
      )
      const seckey = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000001',
        'hex'
      )

      t.plan(1)

      secp256k1.ecdh(pubkey, seckey, (len) => {
        t.same(len, 32)
        return new Uint8Array(32)
      })

      t.end()
    })

    t.test(`${prefix}.ecdh fixtures`, (t) => {
      const fixtures = [
        {
          pubkey:
            '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
          seckey:
            '0000000000000000000000000000000000000000000000000000000000000001',
          hash:
            '0f715baf5d4c2ed329785cef29e562f73488c8a2bb9dbc5700b361d54b9b0554',
        },
      ]

      for (let { pubkey, seckey, hash } of fixtures) {
        pubkey = Buffer.from(pubkey, 'hex')
        seckey = Buffer.from(seckey, 'hex')
        const result = secp256k1.ecdh(pubkey, seckey, Buffer.alloc)
        t.same(result.toString('hex'), hash)
      }

      t.end()
    })

    t.end()
  })
}

for (const tp of getAvailableTypes()) createTests(tp)
