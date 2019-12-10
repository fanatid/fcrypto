#!/usr/bin/env node

// Stupid copy with platform and arch.
// Only release addon right now, debug not used. Maybe in future?
// No arguments, maybe later.

const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'build', 'Release', 'addon.node')
const addonName = `fcrypto-${process.platform}-${process.arch}.node`
const dest = path.join(__dirname, '..', addonName)
fs.copyFileSync(src, dest)
console.log(`Copied to ${addonName}`)
