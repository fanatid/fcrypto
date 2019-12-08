function diffTime (time) {
  if (time === undefined) return process.hrtime()

  const diff = process.hrtime(time)
  return diff[0] * 1e3 + diff[1] / 1e6
}

function runBench (what, count, fn) {
  const ts = diffTime()
  for (let i = 0; i < count; ++i) fn(i)
  const ms = diffTime(ts)
  console.log(
    `${what}: ${ms.toFixed(2)}ms, ${((count * 1000) / ms).toFixed(3)} op/s`
  )
}

;(async () => {
  const { randomBytes } = require('crypto')

  const addon = await require('../').load('addon')
  addon.secp256k1.init()

  const wasm = await require('../').load('wasm')
  wasm.secp256k1.init()

  const count = 100
  const keys = []
  while (keys.length < count) {
    const seckey = randomBytes(32)
    if (!addon.secp256k1.privateKeyVerify(seckey)) continue

    const pubkey = addon.secp256k1.publicKeyCreate(seckey)
    keys.push({ seckey, pubkey, msg32: randomBytes(32) })
  }

  const sigs = new Array(keys.length)
    .fill(null)
    .map(() => ({ signature: Buffer.allocUnsafe(64), recid: -1 }))

  runBench('addon pubkey create', keys.length, (i) =>
    addon.secp256k1.publicKeyCreate(keys[i].seckey)
  )
  runBench('wasm pubkey create', keys.length, (i) =>
    wasm.secp256k1.publicKeyCreate(keys[i].seckey)
  )
  runBench('addon sign', keys.length, (i) =>
    addon.secp256k1.ecdsaSign(keys[i].msg32, keys[i].seckey, sigs[i].signature)
  )
  runBench('wasm sign', keys.length, (i) =>
    wasm.secp256k1.ecdsaSign(keys[i].msg32, keys[i].seckey, sigs[i].signature)
  )
  runBench('addon verify', keys.length, (i) =>
    addon.secp256k1.ecdsaVerify(
      sigs[i].signature,
      keys[i].msg32,
      keys[i].pubkey
    )
  )
  runBench('wasm verify', keys.length, (i) =>
    wasm.secp256k1.ecdsaVerify(sigs[i].signature, keys[i].msg32, keys[i].pubkey)
  )
})().catch((err) => {
  console.error(err.stack || err)
  process.exit(1)
})
