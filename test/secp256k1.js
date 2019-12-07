const test = require('tape')
const fcrypto = require('../')

function createTests (type) {
  const prefix = `${type}.secp256k1`
  test(prefix, async (t) => {
    const { secp256k1 } = await fcrypto.load(type)
    secp256k1.init()

    // privateKeyVerify
    t.test(`${prefix}.privateKeyVerify test invalid key`, (t) => {
      const key = Buffer.allocUnsafe(32).fill(0)
      t.false(secp256k1.privateKeyVerify(key))
      t.end()
    })

    t.test(`${prefix}.privateKeyVerify test valid key`, (t) => {
      const key = Buffer.from('6f2a6b8bf4b04a62ad2dc3fd22e1f2da1e0f57fc593e9198518c9ba436459f2a', 'hex')
      t.true(secp256k1.privateKeyVerify(key))
      t.end()
    })

    // publicKeyCreate

    t.end()
  })
}

if (!process.browser) createTests('addon')
createTests('wasm')
