## fcrypto API

### Common conventions:

- Functions work with [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array). While [Buffer](https://nodejs.org/api/buffer.html) is awesome, current version for browsers ([feross/buffer](https://github.com/feross/buffer/)) is out of date and in future difference probably will be only bigger. But because Buffer extends Uint8Array, you can pass and receive Buffers easily. Also, work with native Uint8Array reduce final build size, if you do not use Buffer in your browser application.

- Custom type for data output. It's possible pass Buffer or Object which inherits Uint8Array to function for data output. Of course length should match, or you can pass function which accept number of bytes and return instance with specified length.

- In place operations. Some functions doing in place operations. This done for less allocations, if you need new instance this can be easily done with creating it before pass to functions. For example:

```js
const newPrivateKey = fcrypto.secp256k1.privateKeyNegate(Buffer.from(privateKey))
```

<hr>

- [`.ready: Promise<object>`](##ready-promiseobject)
- [`.load(type: string, options: { secp256k1: boolean } = { secp256k1: false }): Promise&lt;object&gt;`](#loadtype-string-options--secp256k1-boolean----secp256k1-false--promiseobject)
- `.secp256k1`
  - [`.init(): void`](#secp256k1init-void)
  - [`.contextRandomize(seed: Uint8Array): void`](#secp256k1contextrandomizeseed-uint8array-void)
  - [`.privateKeyVerify(privateKey: Uint8Array): boolean`](#secp256k1privatekeyverifyprivatekey-uint8array-boolean)
  - [`.privateKeyNegate(privateKey: Uint8Array): Uint8Array`](#secp256k1privatekeynegateprivatekey-uint8array-uint8array)
  - [`.privateKeyTweakAdd(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array`](#secp256k1privatekeytweakaddprivatekey-uint8array-tweak-uint8array-uint8array)
  - [`.privateKeyTweakMul(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array`](#secp256k1privatekeytweakmulprivatekey-uint8array-tweak-uint8array-uint8array)
  - [`.publicKeyCreate(privateKey: Uint8Array, compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1publickeycreateprivatekey-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.publicKeyConvert(publicKey: Uint8Array, compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1publickeyconvertpublickey-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.publicKeyNegate(publicKey: Uint8Array, compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1publickeynegatepublickey-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.publicKeyCombine(publicKeys: Uint8Array[], compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1publickeycombinepublickeys-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.publicKeyTweakAdd(publicKey: Uint8Array, tweak: Uint8Array, compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1publickeytweakaddpublickey-uint8array-tweak-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.publicKeyTweakMul(publicKey: Uint8Array, tweak: Uint8Array, compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1publickeytweakmulpublickey-uint8array-tweak-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.signatureNormalize(signature: Uint8Array): Uint8Array`](#secp256k1signaturenormalizesignature-uint8array-uint8array)
  - [`.signatureExport(signature, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1signatureexportsignature-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.signatureImport(signature, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1signatureimportsignature-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.ecdsaSign(message: Uint8Array, privateKey: Uint8Array, output: Uint8Array | ((_: number) => Uint8Array)): { signature: Uint8Array, recid: number  = (len) => new Uint8Array(len)}`](#secp256k1ecdsasignmessage-uint8array-privatekey-uint8array-output-uint8array--_-number--uint8array--signature-uint8array-recid-number---len--new-uint8arraylen)
  - [`.ecdsaVerify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean`](#secp256k1ecdsaverifysignature-uint8array-message-uint8array-publickey-uint8array-boolean)
  - [`.ecdsaRecover(signature: Uint8Array, recid: number, message: Uint8Array, compressed: boolean = true, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1ecdsarecoversignature-uint8array-recid-number-message-uint8array-compressed-boolean--true-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)
  - [`.ecdh(publicKey: Uint8Array, privateKey: Uint8Array, output: Uint8Array | ((_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array`](#secp256k1ecdhpublickey-uint8array-privatekey-uint8array-output-uint8array--_-number--uint8array--len--new-uint8arraylen-uint8array)

##### .ready: Promise&lt;object&gt;

Because we load library asynchronously, it's can be useful in some other places to know that library is loaded and ready to use. This is possible with `ready` Promise. For simplicity Promise return library itself:

```js
const fcrypto = await require('fcrypto').ready
```

##### .load(type: string, options: { secp256k1: boolean } = { secp256k1: false }): Promise&lt;object&gt;

Usually loading step is not required on importing libraries, but because one of library implementations uses WebAssembly we can not do everything synchronous. `load` function accept `type` (`addon` or `wasm`), which load specified implementation. Each time when function called specified implementation will be loaded, new Objects will be created, so it does not needed call `load` with same `type` more than once.

There is different behaviors in Node.js and browsers. In browser everything simple, only `wasm` is available and will be loaded in any case. In Node.js 4 steps exists:

- Load passed type.
- If type is not passed, `process.env.FCRYPTO_IMPL` used.
- If environment variable is not defined, try load `addon`.
- If `addon` loading is not successful, load `wasm`.

Second argument is `options`:

- `secp256k1: boolean` — if `true` initialize `secp256k` on loading step, otherwise you will need call `secp256k1.init()` directly.

`load` return `Promise` which will be resolved to library exports with functions and Objects for specified `type`.

##### .secp256k1.init(): void

By default, unlike [cryptocoinjs/secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node) secp256k1 context in `fcrypto` is not created automatically by default on initialization and should be created manually. This is done because this library not only for secp256k1 and more over, this curve can be not used at all, in same time secp256k1 context require little more than 1MiB memory.

```js
const fcrypto = await require('fcrypto').load()
fcrypto.secp256k1.init()
```

or

```js
const fcrypto = await require('fcrypto').load(undefined, { secp256k1: true })
```

##### .secp256k1.contextRandomize(seed: Uint8Array): void

Updates the context randomization to protect against side-channel leakage, `seed` should be Uint8Array with length 32.

##### .secp256k1.privateKeyVerify(privateKey: Uint8Array): boolean

Verify a private key.

##### .secp256k1.privateKeyNegate(privateKey: Uint8Array): Uint8Array

Negate a private key in place and return result.

##### .secp256k1.privateKeyTweakAdd(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array

Tweak a private key in place by adding tweak to it.

##### .secp256k1.privateKeyTweakMul(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array

Tweak a private key in place by multiplying it by a tweak.

##### .secp256k1.publicKeyCreate(privateKey: Uint8Array, compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Compute the public key for a secret key.

##### .secp256k1.publicKeyConvert(publicKey: Uint8Array, compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Reserialize public key to another format.

##### .secp256k1.publicKeyNegate(publicKey: Uint8Array, compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Negates a public key in place.

##### .secp256k1.publicKeyCombine(publicKeys: Uint8Array[], compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Add a number of public keys together.

##### .secp256k1.publicKeyTweakAdd(publicKey: Uint8Array, tweak: Uint8Array, compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Tweak a public key by adding tweak times the generator to it.

##### .secp256k1.publicKeyTweakMul(publicKey: Uint8Array, tweak: Uint8Array, compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Tweak a public key by multiplying it by a tweak value.

##### .secp256k1.signatureNormalize(signature: Uint8Array): Uint8Array

Convert a signature to a normalized lower-S form in place.

##### .secp256k1.signatureExport(signature, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Export an ECDSA signature to DER format.

##### .secp256k1.signatureImport(signature, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Parse a DER ECDSA signature.

##### .secp256k1.ecdsaSign(message: Uint8Array, privateKey: Uint8Array, output: Uint8Array | ((\_: number) => Uint8Array)): { signature: Uint8Array, recid: number  = (len) => new Uint8Array(len)}

Create an ECDSA signature.

##### .secp256k1.ecdsaVerify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean

Verify an ECDSA signature.

##### .secp256k1.ecdsaRecover(signature: Uint8Array, recid: number, message: Uint8Array, compressed: boolean = true, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Recover an ECDSA public key from a signature.

##### .secp256k1.ecdh(publicKey: Uint8Array, privateKey: Uint8Array, output: Uint8Array | ((\_: number) => Uint8Array) = (len) => new Uint8Array(len)): Uint8Array

Compute an EC Diffie-Hellman secret in constant time.
