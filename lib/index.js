const importCreateImpl = require('./impl')
const secp256k1Wrapper = require('./secp256k1')

let exportsReadyPesolve
exports.ready = new Promise((resolve) => {
  exportsReadyPesolve = resolve
})

exports.load = async (type) => {
  const impl = await importCreateImpl(type)()
  const obj = {
    secp256k1: secp256k1Wrapper(impl.Secp256k1),
  }

  if (Object.keys(exports).length === 1) Object.assign(exports, obj)
  setTimeout(() => exportsReadyPesolve(exports), 0)

  return obj
}
