const addon = require('bindings')('fcrypto')
const { randomBytes } = require('crypto')

console.log(addon)

while (true) {
  const privkey = randomBytes(32)
  if (!addon.secp256k1.privateKey.verify(privkey)) continue

  const pubkey = Buffer.allocUnsafe(33)
  const ret = addon.secp256k1.publicKey.create(privkey, true, pubkey)

  console.log(ret)
  console.log(privkey.toString('hex'))
  console.log(pubkey.toString('hex'))

  break
}
