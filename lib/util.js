// Replace with https://www.npmjs.com/package/minimalistic-assert in files?
// On minification will be name `minimalistic-assert` minified?
function assert (cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed')
}

module.exports = {
  assert
}
