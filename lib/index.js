const importCreateImpl = require('./impl')
const secp256k1Wrapper = require('./secp256k1')

let exportsReadyPesolve
const ready = new Promise((resolve) => {
  exportsReadyPesolve = resolve
})

let loaded = false
async function load (type, options = {}) {
  const createImpl = importCreateImpl(type)
  const impl = await createImpl()

  const obj = {
    ready,
    load,
    secp256k1: secp256k1Wrapper(impl.Secp256k1),
  }

  if (options.secp256k1) {
    obj.secp256k1.init()
  }

  if (!loaded) {
    loaded = true
    Object.assign(module.exports, obj)
    setTimeout(() => exportsReadyPesolve(module.exports), 0)
  }

  return obj
}

module.exports = {
  ready,
  load,
  secp256k1: secp256k1Wrapper(null),
}
