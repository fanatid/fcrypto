const importCreateImpl = require('./impl')

module.exports = async (type) => {
  const impl = await importCreateImpl(type)()
  return impl
}
