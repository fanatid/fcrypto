#!/usr/bin/env node

// I do not know how better load wasm in browser :(

const fs = require('fs')
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

function getContent (buffer) {
  return `module.exports = Promise.resolve(Buffer.from('${buffer.toString('base64')}', 'base64'))`
}

const args = getArgs()
const buffer = fs.readFileSync(args.input)
const content = getContent(buffer)
fs.writeFileSync(args.output, content, 'utf8')
