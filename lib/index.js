// const { randomBytes } = require('crypto')
const randomBytes = () => Buffer.from('79a89f897b78de47accc15b85992eb790226f40d2c7f05381c8e7455993ec716', 'hex')

console.log('node addon\n------------------------------')
const addon = require('bindings')('addon')
console.log(addon)
while (true) {
  const privkey = randomBytes(32)
  if (addon.secp256k1.privateKeyVerify(privkey) != 0) continue

  const pubkey = Buffer.allocUnsafe(33)
  const ret = addon.secp256k1.publicKeyCreate(pubkey, privkey, true)

  console.log(ret)
  console.log(privkey.toString('hex'))
  console.log(pubkey.toString('hex'))

  break
}

console.log('\nwasm\n------------------------------')
const fs = require('fs')
const path = require('path')

;(async () => {
  // const pkg = require('../build/wasm/fcrypto')
  // await new Promise((resolve) => setTimeout(resolve, 200))
  // console.log(pkg)
  // console.log(pkg._fcrypto_secp256k1_context_create())
  // console.log(pkg._fcrypto_secp256k1_context_create())
  // return

  const code = fs.readFileSync(path.join(__dirname, '..', 'build', 'wasm', 'fcrypto.wasm'))

  const WASM_PAGE_SIZE = 64 * 1024
  const INITIAL_TOTAL_MEMORY = WASM_PAGE_SIZE * 256
  const wasmMemory = new WebAssembly.Memory({
    initial: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
    maximum: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE
  })
  const HEAPU8 = new Uint8Array(wasmMemory.buffer)

  // DYNAMICTOP_PTR magic
  // https://emscripten.org/docs/introducing_emscripten/release_notes.html v1.36.9: 8/24/2016
  // https://github.com/emscripten-core/emscripten/pull/4496
  // *
  // DYNAMIC_BASE depends from GLOBAL_BASE & STATIC_BUMP from settings, see
  // https://github.com/emscripten-core/emscripten/blob/1.39.3/emscripten.py#L788
  // *
  // Most easiest way find out values will be generate JS file and check it
  const HEAP32 = new Int32Array(wasmMemory.buffer)
  const DYNAMICTOP_PTR = 3264
  const DYNAMIC_BASE = 1052032
  HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

  const wasmTableInitial = 4
  const wasmTable = new WebAssembly.Table({
   initial: wasmTableInitial,
   maximum: wasmTableInitial,
   element: 'anyfunc'
  });

  function abort (what) {
    throw new WebAssembly.RuntimeError(`abort(${what}). Build with -s ASSERTIONS=1 for more info.`)
  }

  function _emscripten_get_heap_size() {
    console.log('_emscripten_get_heap_size')
    return HEAPU8.length
  }

  function _emscripten_resize_heap () {
    console.log('_emscripten_resize_heap')
    abort('OOM')
  }

  function _emscripten_memcpy_big(dest, src, num) {
    console.log('_emscripten_memcpy_big')
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
  }

  const { module, instance } = await WebAssembly.instantiate(code, {
    env: {
      memory: wasmMemory,
      table: wasmTable,
      __table_base: 0,

      abort,
      _emscripten_get_heap_size,
      _emscripten_resize_heap,
      _emscripten_memcpy_big,
    },
    global: { NaN, Infinity }
  })

  console.log(instance.exports)

  const ctx = instance.exports._fcrypto_secp256k1_context_create()
  console.log(`context: ${ctx}`)

  while (true) {
    const privkey = randomBytes(32)
    const ptr32 = instance.exports._malloc(32)
    console.log(`ptr32: ${ptr32}`)

    HEAPU8.set(privkey, ptr32)
    if (instance.exports._fcrypto_secp256k1_seckey_verify(ctx, ptr32)) {
      instance.exports._free(ptr32)
      continue
    }

    const ptr33 = instance.exports._malloc(33)
    console.log(`ptr33: ${ptr33}`)
    const ret = instance.exports._fcrypto_secp256k1_pubkey_create(ctx, ptr33, ptr32, 1)

    console.log(ret)
    console.log(privkey.toString('hex'))
    console.log(Buffer.from(HEAPU8.subarray(ptr33, ptr33 + 33)).toString('hex'))

    instance.exports._free(ptr33)
    instance.exports._free(ptr32)

    break
  }
})().catch((err) => {
  console.error(err.stack || err)
  process.exit(1)
})
