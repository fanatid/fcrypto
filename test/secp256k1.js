const test = require('tape')
const fcrypto = require('../')

function createTests(type) {
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
          key: new Uint8Array(32), // filled by zeros by default
          valid: false,
        },
        {
          key: Buffer.from(
            '6f2a6b8bf4b04a62ad2dc3fd22e1f2da1e0f57fc593e9198518c9ba436459f2a',
            'hex'
          ),
          valid: true,
        },
      ]

      for (const { key, valid } of fixtures) {
        t.same(secp256k1.privateKeyVerify(key), valid)
      }

      t.end()
    })

    // publicKeyCreate

    t.end()
  })
}

if (!process.browser) createTests('addon')
createTests('wasm')
