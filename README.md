# fcrypto

- [Loading process](#loading-process)
- [API](#api)
- [Examples](#examples)
- [License](#license)

<details>
  <summary>Motivation</summary>

3 years ago I started work on [Node.js](https://nodejs.org/) bindings to [bitcoin-core/secp256k1](https://github.com/bitcoin-core/secp256k1). Right now I'm not sure why exactly I start work on this, I think because there was no fast secp256k1 implementation for Node.js required for cryptocurrencies. There was few months of hard work. As result [cryptocoinjs/secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node) received Node.js bindings (with [NAN](https://github.com/nodejs/nan)), pure js based on [elliptic](https://github.com/indutny/elliptic) & [bn.js](https://github.com/indutny/bn.js) (which got performance and fixing patches) and new pure js implementation (mostly it was for educational purposes, but in this way elliptic and bn.js was improved).


Time is going and with every new Node.js version it's harder support bindings with NAN. Compilation issues still exists and developers create issues about new features. In same time, [N-API](https://nodejs.org/api/n-api.html) became very stable (It's surprised, but from January 2020 N-API will be available as non-experimental feature in any maintained Node.js version), [WebAssembly](https://webassembly.org/) can be used in [88.66%](https://caniuse.com/#search=wasm) of browsers and ecosystem grow fast. 


So, I started new project and call it `fcrypto`.
</details>

`fcrypto` means `fast crypto`. Plan is provide Node.js bindings based on N-API and WebAssembly for browsers (or for Node.js if addon can not be built).

Currently supported:

  - secp256k1 ([bitcoin-core/secp256k1](https://github.com/bitcoin-core/secp256k1))

<!--
  - keccak ([XKCP/XKCP](https://github.com/XKCP/XKCP))
  - SHA
  - ripemd
  - scrypt
  - pbkdf2
  - ECDSA (secp256r1, nist256p1)
  - EdDSA (ed25519)
  - BLAKE
-->

## Loading process

If you use `fcrypo` directly on indirectly through dependencies, it's required wait loading first. Libraries should not be responsible for this. For example, in project entrypoint:

```js
require('fcrypto').load().then(startApp)
```

## API

### Common conventions:

- Functions work with [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array). While [Buffer](https://nodejs.org/api/buffer.html) is awesome, current version for browsers ([feross/buffer](https://github.com/feross/buffer/)) is out of date and in future difference probably will be only bigger. But because Buffer extends Uint8Array, you can pass and receive Buffers easily. Also, work with native Uint8Array reduce final build size, if you do not use Buffer in your browser application.

- Custom type for data output. It's possible pass Buffer or Object which inherits Uint8Array to function for data output. Of course length should match, or you can pass function which accept number of bytes and return instance with specified length.

- In place operations. Some functions doing in place operations. This done for less allocations, if you need new instance this can be easily done with creating it before pass to functions. For example:

```js
const newPrivateKey = fcrypto.secp256k1.privateKeyNegate(Buffer.from(privateKey))
```

### List

- [`.ready: Promise<object>`](#)
- [`.load(type: string): object`](#)
- `.secp256k1`
  - [`.init(): void`](#)
  - [`.contextRandomize(seed: Uint8Array): void`](#)
  - [`.privateKeyVerify(privateKey: Uint8Array): boolean`](#)
  - [`.privateKeyNegate(privateKey: Uint8Array): Uint8Array`](#)
  - [`.privateKeyTweakAdd(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array`](#)
  - [`.privateKeyTweakMul(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array`](#)

<!--
##### .secp256k1.publicKeyCreate
##### .secp256k1.publicKeyConvert
##### .secp256k1.publicKeyNegate
##### .secp256k1.publicKeyCombine
##### .secp256k1.publicKeyTweakAdd
##### .secp256k1.publicKeyTweakMul
##### .secp256k1.signatureNormalize
##### .secp256k1.signatureExport
##### .secp256k1.signatureImport
##### .secp256k1.ecdsaSign
##### .secp256k1.ecdsaVerify
##### .secp256k1.ecdsaRecover
##### .secp256k1.ecdh
##### .secp256k1.ecdhUnsafe
-->

##### .ready: Promise&lt;object&gt;

Because we load library asynchronously, it's can be useful in some other place to know that library is loaded and ready to use. This is possible with `ready` Promise. For simplicity Promise return library itself:

```js
const fcrypto = await require('fcrypto').ready
```

##### .load(type: string): Promise&lt;object&gt;

Usually loading step is not required on importing libraries, but because one of library implementations uses WebAssembly we can not do everything synchronous. `load` function accept only one argument: `type` (`addon` or `wasm`), which load specified implementation. Each time when function called specified implementation will be loaded, new Objects will be created, so it does not needed call `load` with same `type` more than once.

There is different behaviors in Node.js and browsers. In browser everything simple, only `wasm` is available and will be loaded in any case. In Node.js 4 steps exists:

- Load passed type.
- If type is not passed, `process.env.FCRYPTO_IMPL` used.
- If environment variable is not defined, try load `addon`.
- If `addon` loading is not successful, load `wasm`.

`load` return `Promise` which will be resolved to library exports with functions and Objects for specified `type`.

##### .secp256k1.init(): void

By default, unlike [cryptocoinjs/secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node) secp256k1 context in `fcrypto` is not created automatically on initialization and should be created manually. This is done because this library not only for secp256k1 and more over, this curve can be not used at all, in same time secp256k1 context require little more than 1MiB memory.

```js
const fcrypto = await require('fcrypto').load()
fcrypto.secp256k1.init()
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

## Examples

<!--
### Secp256k1

```js
const { randomBytes } = require('crypto')
const fcrypto = require('fcrypto')
await fcrypto.load()

fcrypto.secp256k1.init()

// generate message to sign
const msg = randomBytes(32)

// generate privKey
let privKey
do {
  privKey = randomBytes(32)
} while (!secp256k1.privateKeyVerify(privKey))

// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)

// sign the message
const sigObj = secp256k1.sign(msg, privKey)

// verify the signature
console.log(secp256k1.verify(msg, sigObj.signature, pubKey))
// => true
```
-->

## LICENSE

This library is free and open-source software released under the MIT license.
