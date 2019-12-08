function assert (cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed')
}

assert.isUint8Array = (name, val, length) => {
  assert(val instanceof Uint8Array, `Expected ${name} to be Uint8Array`)

  if (length !== undefined) {
    assert(val.length === length, `Expected ${name} to be Uint8Array with length ${length}`)
  }
}

module.exports = {
  assert
}
