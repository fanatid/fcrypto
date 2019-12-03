function diffTime (time, resolution = 'milliseconds') {
  if (time === undefined) return process.hrtime()

  const diff = process.hrtime(time)
  return diff[0] * 1e3 + diff[1] / 1e6
}

async function initWasm () {
  const fs = require('fs')
  const path = require('path')
  const code = fs.readFileSync(path.join(__dirname, '..', 'build', 'wasm', 'fcrypto.wasm'))

  const WASM_PAGE_SIZE = 64 * 1024
  const INITIAL_TOTAL_MEMORY = WASM_PAGE_SIZE * 256
  const wasmMemory = new WebAssembly.Memory({
    initial: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
    maximum: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE
  })
  const HEAPU8 = new Uint8Array(wasmMemory.buffer)

  const HEAP32 = new Int32Array(wasmMemory.buffer)
  const DYNAMICTOP_PTR = 3520
  const DYNAMIC_BASE = 1052288
  HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

  const wasmTableInitial = 6
  const wasmTable = new WebAssembly.Table({
   initial: wasmTableInitial,
   maximum: wasmTableInitial,
   element: 'anyfunc'
  });

  function abort (what) {
    throw new WebAssembly.RuntimeError(`abort(${what}). Build with -s ASSERTIONS=1 for more info.`)
  }

  function _emscripten_get_heap_size() {
    return HEAPU8.length
  }

  function _emscripten_resize_heap () {
    abort('OOM')
  }

  function _emscripten_memcpy_big(dest, src, num) {
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
  })

  const { exports: fns } = instance

  const ctx = fns._fcrypto_secp256k1_context_create()
  const ptr64 = fns._malloc(64)
  const ptr4 = fns._malloc(4)
  const ptr32_1 = fns._malloc(32)
  const ptr32_2 = fns._malloc(32)
  const ptr33 = fns._malloc(33)

  return {
    publicKeyCreate (pubkey, seckey) {
      HEAPU8.set(seckey, ptr32_1)
      const ret = fns._fcrypto_secp256k1_pubkey_create(ctx, ptr33, ptr32_1, 1)
      pubkey.set(HEAPU8.subarray(ptr33, ptr33 + 33), 0)
      return ret
    },

    ecdsaSign (sig, msg32, seckey) {
      HEAPU8.set(msg32, ptr32_1)
      HEAPU8.set(seckey, ptr32_2)

      const ret = fns._fcrypto_secp256k1_ecdsa_sign(ctx, ptr64, ptr4, ptr32_1, ptr32_2)
      if (ret !== 0) throw new Error(`sign return code ${ret}`)

      sig.recid = HEAPU8[ptr4]
      sig.signature.set(HEAPU8.subarray(ptr64, ptr64 + 64), 0)

      return ret
    },

    ecdsaVerify (sig, msg32, pubkey) {
      HEAPU8.set(sig, ptr64)
      HEAPU8.set(msg32, ptr32_1)
      HEAPU8.set(pubkey, ptr33)
      return fns._fcrypto_secp256k1_ecdsa_verify(ctx, ptr64, ptr32_1, ptr33, pubkey.length)
    }
  }
}

function runBench (what, count, fn) {
  const ts = diffTime()
  for (let i = 0; i < count; ++i) fn(i)
  const ms = diffTime(ts)
  console.log(`${what}: ${ms.toFixed(2)}ms, ${(count * 1000 / ms).toFixed(3)} op/s`)
}

;(async () => {
  const { randomBytes } = require('crypto')
  const { secp256k1: addon } = require('bindings')('addon')
  const wasm = await initWasm()

  const count = 50 * 1000
  const keys = []
  while (keys.length < count) {
    const seckey = randomBytes(32)
    if (addon.privateKeyVerify(seckey) != 0) continue

    const pubkey = Buffer.allocUnsafe(33)
    if (addon.publicKeyCreate(pubkey, seckey, true) != 0) continue

    keys.push({ seckey, pubkey, msg32: Buffer.allocUnsafe(32) })
  }

  const sigs = new Array(keys.length).fill(null).map(() => ({ signature: Buffer.allocUnsafe(64), recid: -1 }))

  const pubkey = Buffer.allocUnsafe(33)
  runBench('addon pubkey create', keys.length, (i) => addon.publicKeyCreate(pubkey, keys[i].seckey, true))
  runBench('wasm pubkey create', keys.length, (i) => wasm.publicKeyCreate(pubkey, keys[i].seckey, true))
  runBench('addon sign', keys.length, (i) => addon.ecdsaSign(sigs[i], keys[i].msg32, keys[i].seckey))
  runBench('wasm sign', keys.length, (i) => wasm.ecdsaSign(sigs[i], keys[i].msg32, keys[i].seckey))
  runBench('addon verify', keys.length, (i) => addon.ecdsaVerify(sigs[i].signature, keys[i].msg32, keys[i].pubkey))
  runBench('wasm verify', keys.length, (i) => wasm.ecdsaVerify(sigs[i].signature, keys[i].msg32, keys[i].pubkey))
})().catch((err) => {
  console.error(err.stack || err)
  process.exit(1)
})
