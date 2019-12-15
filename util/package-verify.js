#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const ssri = require('ssri')
const yargs = require('yargs')

function getArgs () {
  return yargs
    .usage('Usage: $0 <command> [options]')
    .wrap(yargs.terminalWidth())
    .options({
      file: {
        alias: 'f',
        description: 'Path to package.json',
        type: 'string',
      },
    })
    .help('help')
    .alias('help', 'h').argv
}

function getIntegrity (version) {
  try {
    const npmInfo = `npm info --json fcrypto@${version}`
    return JSON.parse(execSync(npmInfo).toString()).dist.integrity
  } catch (err) {
    console.log(`Cann't find fcrypto@${version} on npm`)
    process.exit(1)
  }
}

const args = getArgs()

const data = fs.readFileSync(args.file)
const version = path.parse(args.file).name.match(/-(.*)$/)[1]
const integrity = getIntegrity(version)

if (!ssri.checkData(data, integrity)) {
  console.log(`Checksum mismatch for fcrypto@${version}`)
  process.exit(1)
}

console.log('OK')
