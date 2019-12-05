module.exports = (type = process.env.FCRYPTO_IMPL) => {
  if (type !== undefined) return require(`./${type}`)

  try {
    return require('./addon')
  } catch (err) {
    return require('./wasm')
  }
}
