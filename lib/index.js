const addon = require('bindings')('addon')
const { randomBytes } = require('crypto')
const util = require('util')

console.log(util.inspect(addon, { depth: null }))

while (true) {
  const privkey = randomBytes(32)
  if (addon.secp256k1.privateKey.verify(privkey)) continue

  const pubkey = Buffer.allocUnsafe(33)
  const ret = addon.secp256k1.publicKey.create(pubkey, privkey, true)

  console.log(ret)
  console.log(privkey.toString('hex'))
  console.log(pubkey.toString('hex'))

  break
}
