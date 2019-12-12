function assert (cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed')
}

assert.isUint8Array = (name, value, length) => {
  assert(value instanceof Uint8Array, `Expected ${name} to be Uint8Array`)

  if (length !== undefined) {
    if (Array.isArray(length)) {
      const numbers = length.join(', ')
      const msg = `Expected ${name} to be Uint8Array with length [${numbers}]`
      assert(length.includes(value.length), msg)
    } else {
      const msg = `Expected ${name} to be Uint8Array with length ${length}`
      assert(value.length === length, msg)
    }
  }
}

module.exports = assert
