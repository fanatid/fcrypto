const WASM_PAGE_SIZE = {{ WASM_PAGE_SIZE }}
const INITIAL_TOTAL_MEMORY = {{ INITIAL_TOTAL_MEMORY }}
const wasmMemory = new WebAssembly.Memory({
  initial: {{ WASM_MEMORY_INITIAL }},
  maximum: {{ WASM_MEMORY_MAXIMUM }},
})

const HEAPU8 = new Uint8Array(wasmMemory.buffer)
const HEAP32 = new Int32Array(wasmMemory.buffer)

const DYNAMICTOP_PTR = {{ DYNAMICTOP_PTR }}
const DYNAMIC_BASE = {{ DYNAMIC_BASE }}
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE

const wasmTable = new WebAssembly.Table({
  initial: {{ WASM_TABLE_INITIAL }},
  maximum: {{ WASM_TABLE_MAXIMUM }},
  element: 'anyfunc',
})

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

const importObject = {
  env: {{ IMPORT_MAP }},
}

module.exports = {
  heapu8: HEAPU8,
  importObject,
  exportMap: {{ EXPORT_MAP }},
}
