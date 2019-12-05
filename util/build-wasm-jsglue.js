#!/usr/bin/env node

// I did not find a way receive required values from Emscripten.
// Everything what we can pass do not have access to required variables or useless.
// So, we create JS file by emcc and use it only for extracting data what we need.
// Later we use only glue file and WASM file itself.
// See `wasm-parse-emscripten-jsglue.js.tpl` as template and `lib/wasm/glue.js` as result.

const fs = require('fs')
const path = require('path')
const lodash = require('lodash')
const yargs = require('yargs')

function getArgs () {
  return yargs
    .usage('Usage: $0 <command> [options]')
    .wrap(yargs.terminalWidth())
    .options({
      input: {
        alias: 'i',
        description: 'Path to input file',
        type: 'string',
      },
      output: {
        alias: 'o',
        description: 'Path to output file',
        type: 'string',
      },
    })
    .help('help').alias('help', 'h')
    .argv
}

function parseContent (content) {
  const WASM_PAGE_SIZE = content.match(/var WASM_PAGE_SIZE = (\d+);/)
  const INITIAL_TOTAL_MEMORY = content.match(/var INITIAL_TOTAL_MEMORY = (\d+);/)
  const WASM_MEMORY = content.match(/WebAssembly\.Memory\({\n  "initial": (.*?),\n  "maximum": (.*?)\n/)
  const DYNAMIC = content.match(/var DYNAMIC_BASE = (\d+), DYNAMICTOP_PTR = (\d+);/)
  const WASM_TABLE = content.match(/WebAssembly.Table\({\n "initial": (\d+),\n "maximum": (\d+),/)

  const imRE = new RegExp('var asmLibraryArg = {(.*?)};', 'sm')
  const IMPORT_MAP = content.match(imRE)[1]

  const emRE = new RegExp('Module\\["_(\\w+)"] = function\\(\\) {\n return Module\\["asm"]\\["(\\w+)"].apply\\(null, arguments\\);', 'g')
  const EXPORT_MAP = content.matchAll(emRE)

  return {
    // memory
    WASM_PAGE_SIZE: parseInt(WASM_PAGE_SIZE[1], 10),
    INITIAL_TOTAL_MEMORY: parseInt(INITIAL_TOTAL_MEMORY[1], 10),
    WASM_MEMORY_INITIAL: WASM_MEMORY[1],
    WASM_MEMORY_MAXIMUM: WASM_MEMORY[1],
    DYNAMIC_BASE: parseInt(DYNAMIC[1], 10),
    DYNAMICTOP_PTR: parseInt(DYNAMIC[2], 10),

    // table
    WASM_TABLE_INITIAL: parseInt(WASM_TABLE[1], 10),
    WASM_TABLE_MAXIMUM: parseInt(WASM_TABLE[2], 10),

    // maps
    IMPORT_MAP: ['{', ...IMPORT_MAP.replace(/^ "(\w+)": (\w+),?$/gm, '$1: $2,').split('\n').slice(1, -1).map((x) => `    ${x}`), '  }'].join('\n'),
    EXPORT_MAP: ['{', ...Array.from(EXPORT_MAP, (m) => `    ${m[1]}: '${m[2]}',`), '  }'].join('\n'),
  }
}

const args = getArgs()
const content = fs.readFileSync(args.input, 'utf8')
const vars = parseContent(content)
const tplText = fs.readFileSync(`${__filename}.tpl`, 'utf8')
const tpl = lodash.template(tplText, { interpolate: /{{([\s\S]+?)}}/g })
const jsglue = tpl(vars)
fs.writeFileSync(args.output, jsglue, 'utf8')
