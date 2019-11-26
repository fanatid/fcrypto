const addon = require('bindings')('addon')
const { randomBytes } = require('crypto')

console.log(addon)

while (true) {
  const privkey = randomBytes(32)
  if (addon.secp256k1.privateKeyVerify(privkey) != 0) continue

  const pubkey = Buffer.allocUnsafe(33)
  const ret = addon.secp256k1.publicKeyCreate(pubkey, privkey, true)

  console.log(ret)
  console.log(privkey.toString('hex'))
  console.log(pubkey.toString('hex'))

  break
}
