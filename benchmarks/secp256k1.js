function diffTime(time) {
  if (time === undefined) return process.hrtime()

  const diff = process.hrtime(time)
  return diff[0] * 1e3 + diff[1] / 1e6
}

function runBench(what, count, fn) {
  const ts = diffTime()
  for (let i = 0; i < count; ++i) fn(i)
  const ms = diffTime(ts)
  console.log(
    `${what}: ${ms.toFixed(2)}ms, ${((count * 1000) / ms).toFixed(3)} op/s`
  )
}

;(async () => {
  const { randomBytes } = require('crypto')
  const { secp256k1: addon } = await require('../')('addon')
  const wasm = await require('../')('wasm')

  const count = 100
  const keys = []
  while (keys.length < count) {
    const seckey = randomBytes(32)
    if (addon.privateKeyVerify(seckey) !== 0) continue

    const pubkey = Buffer.allocUnsafe(33)
    if (addon.publicKeyCreate(pubkey, seckey, true) !== 0) continue

    keys.push({ seckey, pubkey, msg32: Buffer.allocUnsafe(32) })
  }

  const sigs = new Array(keys.length)
    .fill(null)
    .map(() => ({ signature: Buffer.allocUnsafe(64), recid: -1 }))

  const pubkey = Buffer.allocUnsafe(33)
  runBench('addon pubkey create', keys.length, (i) =>
    addon.publicKeyCreate(pubkey, keys[i].seckey, true)
  )
  runBench('wasm pubkey create', keys.length, (i) =>
    wasm.publicKeyCreate(pubkey, keys[i].seckey, true)
  )
  runBench('addon sign', keys.length, (i) =>
    addon.ecdsaSign(sigs[i], keys[i].msg32, keys[i].seckey)
  )
  runBench('wasm sign', keys.length, (i) =>
    wasm.ecdsaSign(sigs[i], keys[i].msg32, keys[i].seckey)
  )
  runBench('addon verify', keys.length, (i) =>
    addon.ecdsaVerify(sigs[i].signature, keys[i].msg32, keys[i].pubkey)
  )
  runBench('wasm verify', keys.length, (i) =>
    wasm.ecdsaVerify(sigs[i].signature, keys[i].msg32, keys[i].pubkey)
  )
})().catch((err) => {
  console.error(err.stack || err)
  process.exit(1)
})
