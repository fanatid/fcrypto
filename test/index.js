const test = require('tape')
const fcrypto = require('../')

test('check properties', (t) => {
  const things = [
    { prop: 'ready', what: 'Promise' },
    { prop: 'load', what: 'AsyncFunction' },
    { prop: 'secp256k1', what: 'Object' },
  ]
  for (const { prop, what } of things) {
    const actual = Object.prototype.toString.call(fcrypto[prop]).slice(8, -1)
    t.same(actual, what, `Property ${prop} should be ${what}`)
  }

  t.end()
})
