const fcrypto = require('../')
const util = require('./util')

const prng = util.createPRNG()
function createFixtures (secp256k1) {
  const size = 1000

  const fixtures = []
  while (fixtures.length < size) {
    const seckey = prng.randomBytes(32)
    if (!secp256k1.privateKeyVerify(seckey)) continue

    const pubkey = secp256k1.publicKeyCreate(seckey, true, Buffer.alloc)
    const msg32 = prng.randomBytes(32)
    const sig = secp256k1.ecdsaSign(msg32, seckey, Buffer.alloc)

    fixtures.push({ seckey, pubkey, msg32, sig })
  }

  return fixtures
}

async function importFcrypto (name) {
  const { secp256k1 } = await fcrypto.load(name, { secp256k1: true })
  return secp256k1
}

function importSecp256k1 (name) {
  try {
    const secp256k1 = require(`secp256k1/${name}`)
    return {
      publicKeyCreate: secp256k1.publicKeyCreate,
      ecdsaSign: secp256k1.sign,
      ecdsaVerify: (sig, msg32, pubkey) => secp256k1.verify(msg32, sig, pubkey),
      ecdsaRecover: (sig, recid, msg32) => secp256k1.recover(msg32, sig, recid),
      ecdh: secp256k1.ecdh,
    }
  } catch (err) {
    return null
  }
}

async function runBenchmark () {
  // async import and set implementations
  const impls = {
    'fcrypto/addon': await importFcrypto('addon'),
    'fcrypto/wasm': await importFcrypto('wasm'),
    'secp256k1/addon': importSecp256k1('bindings'),
    'secp256k1/elliptic': importSecp256k1('elliptic'),
    'secp256k1/js': importSecp256k1('js'),
  }

  // create fixtures
  const ts = util.diffTime()
  const fixtures = createFixtures(impls['fcrypto/addon'])
  console.log(
    `Create ${fixtures.length} fixtures in ${util.diffTimePretty(ts)}`
  )

  let currentFixtureIndex = 0
  function fixturesWrapper (fn) {
    return () => {
      const fixture = fixtures[currentFixtureIndex++]
      if (currentFixtureIndex >= fixtures.length) currentFixtureIndex = 0

      fn(fixture)
    }
  }

  const benchmarkOptions = {
    onStart () {
      currentFixtureIndex = 0
    },
    onCycle () {
      currentFixtureIndex = 0
    },
  }

  // helper
  function runSuite (suiteName, testFn) {
    const benches = []
    for (const [name, secp256k1] of Object.entries(impls)) {
      if (!secp256k1) continue

      const fn = fixturesWrapper((fixture) => testFn(secp256k1, fixture))
      benches.push({ name, fn, options: benchmarkOptions })
    }

    util.runSuite(`secp256k1.${suiteName}`, benches)
  }

  // run suites
  runSuite('publicKeyCreate', (secp256k1, fixture) => {
    secp256k1.publicKeyCreate(fixture.seckey)
  })
  runSuite('ecdsaSign', (secp256k1, fixture) => {
    secp256k1.ecdsaSign(fixture.msg32, fixture.seckey)
  })
  runSuite('ecdsaVerify', (secp256k1, fixture) => {
    secp256k1.ecdsaVerify(fixture.sig.signature, fixture.msg32, fixture.pubkey)
  })
  runSuite('ecdsaRecover', (secp256k1, fixture) => {
    const { signature, recid } = fixture.sig
    secp256k1.ecdsaRecover(signature, recid, fixture.msg32)
  })
  runSuite('ecdh', (secp256k1, fixture) => {
    secp256k1.ecdh(fixture.pubkey, fixture.seckey)
  })
}

runBenchmark().catch((err) => {
  console.error(err.stack || err)
  process.exit(1)
})
