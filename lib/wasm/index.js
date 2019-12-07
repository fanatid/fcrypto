const secp256k1Wrapper = require('./secp256k1')

module.exports = async () => {
  const code = await require('./wasm-bin')
  const { heapu8, heap32, importObject, exportMap } = require('./wasm-glue')
  const { instance } = await WebAssembly.instantiate(code, importObject)

  const fns = {}
  for (const [fnFull, fnShort] of Object.entries(exportMap)) {
    fns[fnFull] = instance.exports[fnShort]
  }

  // TODO:
  // Is it possible to work in big-endian? Need add check with throwing error?

  const env = {
    fns,
    heapu8,
    heap32,
  }

  return {
    Secp256k1: secp256k1Wrapper(env),
  }
}
