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
        secp256k1.contextRandomize(new Uint8Array(31))
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
        secp256k1.privateKeyVerify(new Uint8Array(31))
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
        secp256k1.privateKeyNegate(new Uint8Array(31))
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
        secp256k1.privateKeyTweakAdd(new Uint8Array(31))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakAdd with invalid tweak`, (t) => {
      const pk = new Uint8Array(32)

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(pk, null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyTweakAdd(pk, new Uint8Array(31))
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
        secp256k1.privateKeyTweakMul(new Uint8Array(31))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.privateKeyTweakMul with invalid tweak`, (t) => {
      const pk = new Uint8Array(32)

      t.throws(() => {
        secp256k1.privateKeyTweakMul(pk, null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.privateKeyTweakMul(pk, new Uint8Array(31))
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
        secp256k1.publicKeyCreate(new Uint8Array(31))
      }, /^Error: Expected private key to be Uint8Array with length 32$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyCreate with invalid output`, (t) => {
      const seckey = new Uint8Array(32)

      t.throws(() => {
        secp256k1.publicKeyCreate(seckey, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyCreate(seckey, true, new Uint8Array(31))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyCreate(seckey, false, new Uint8Array(31))
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
        secp256k1.publicKeyConvert(new Uint8Array(31))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyConvert with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)

      t.throws(() => {
        secp256k1.publicKeyConvert(pubkey, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyConvert(pubkey, true, new Uint8Array(31))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyConvert(pubkey, false, new Uint8Array(31))
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
        secp256k1.publicKeyNegate(new Uint8Array(31))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyNegate with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)

      t.throws(() => {
        secp256k1.publicKeyNegate(pubkey, true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyNegate(pubkey, true, new Uint8Array(31))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyNegate(pubkey, false, new Uint8Array(31))
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
        secp256k1.publicKeyCombine([new Uint8Array(31)])
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyCombine with invalid output`, (t) => {
      const pubkey = Buffer.alloc(33, 0x01)

      t.throws(() => {
        secp256k1.publicKeyCombine([pubkey], true, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyCombine([pubkey], true, new Uint8Array(31))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyCombine([pubkey], false, new Uint8Array(31))
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
        secp256k1.publicKeyTweakAdd(new Uint8Array(31))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakAdd with invalid tweak`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyTweakAdd(new Uint8Array(33), null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(new Uint8Array(33), new Uint8Array(31))
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
        secp256k1.publicKeyTweakAdd(pubkey, tweak, true, new Uint8Array(31))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyTweakAdd(pubkey, tweak, false, new Uint8Array(31))
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
        secp256k1.publicKeyTweakMul(new Uint8Array(31))
      }, /^Error: Expected public key to be Uint8Array with length \[33, 65]$/)

      t.end()
    })

    t.test(`${prefix}.publicKeyTweakMul with invalid tweak`, (t) => {
      t.throws(() => {
        secp256k1.publicKeyTweakMul(new Uint8Array(33), null)
      }, /^Error: Expected tweak to be Uint8Array$/)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(new Uint8Array(33), new Uint8Array(31))
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
        secp256k1.publicKeyTweakMul(pubkey, tweak, true, new Uint8Array(31))
      }, /^Error: Expected output to be Uint8Array with length 33$/)

      t.throws(() => {
        secp256k1.publicKeyTweakMul(pubkey, tweak, false, new Uint8Array(31))
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
        secp256k1.signatureNormalize(new Uint8Array(63))
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
        secp256k1.signatureExport(new Uint8Array(63))
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

      // t.doesNotThrow(() => {
      //   secp256k1.signatureImport(new Uint8Array(63))
      // })

      t.end()
    })

    t.test(`${prefix}.signatureImport with invalid output`, (t) => {
      const sig = Buffer.from('3006020101020101', 'hex')

      t.throws(() => {
        secp256k1.signatureImport(sig, null)
      }, /^Error: Expected output to be Uint8Array$/)

      t.throws(() => {
        secp256k1.signatureImport(sig, new Uint8Array(63))
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
    // ecdsaVerify
    // ecdsaRecover
    // ecdh

    t.end()
  })
}

for (const tp of getAvailableTypes()) createTests(tp)
