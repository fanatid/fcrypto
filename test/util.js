function getAvailableTypes () {
  if (process.env.FCRYPTO_TEST_ONLY) return [process.env.FCRYPTO_TEST_ONLY]

  if (process.browser) return ['wasm']

  return ['addon', 'wasm']
}

module.exports = {
  getAvailableTypes,
}
