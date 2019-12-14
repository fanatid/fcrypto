const { randomBytes } = require('crypto')
const benchmark = require('benchmark')
const prettyMs = require('pretty-ms')
const { XorShift128Plus } = require('xorshift.js')

function createPRNG () {
  const seed = process.env.SEED || randomBytes(32).toString('hex')
  console.log(`Benchmark seed for random data: ${seed}`)

  return new XorShift128Plus(seed)
}

function diffTime (time) {
  if (time === undefined) return process.hrtime()

  const diff = process.hrtime(time)
  return diff[0] * 1e3 + diff[1] / 1e6
}

function diffTimePretty (time) {
  return prettyMs(diffTime(time))
}

function runSuite (name, benches) {
  const suite = new benchmark.Suite(name, {
    onStart () {
      console.log(`Benchmarking: ${name}`)
      console.log('--------------------------------------------------')
    },
    onCycle (event) {
      console.log(String(event.target))
    },
    onError (event) {
      console.error(event.target.error)
    },
    onComplete () {
      console.log('==================================================')
    },
  })

  for (const { name, fn, options } of benches) {
    suite.add(name, fn, options)
  }

  suite.run()
}

module.exports = {
  createPRNG,
  diffTime,
  diffTimePretty,
  runSuite,
}
