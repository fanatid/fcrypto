const path = require('path')

// TODO: load from build/Release if prebuild loading is not success
// see bindings package
module.exports = async () => {
  const location = path.join(
    __dirname,
    '..',
    '..',
    `fcrypto-${process.platform}-${process.arch}.node`
  )
  return require(location)
}
