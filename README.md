# fcrypto

- [Installation](#installation)
- [Loading process](#loading-process)
- [docs/API.md](docs/API.md)
- [docs/Examples.md](docs/Examples.md)
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

### Installation

`fcrypto` releases includes prebuilt addons for Linux (x64), MacOS and Windows (x64). But everything for building addon from distributed package included too, so you able check code and compile own addon.

By default `ignore-scripts`  in [yarn](https://yarnpkg.com/) and [npm](https://www.npmjs.com) set to `false`, so on installation package manager will try build addon and you will use own builded version, but if building fails, do not worry. If you have OS in list which listed above, precompiled addon will be used, if not, then WebAssembly will be used.

It's **highly recommended** set `ignore-scripts` to `true`. See info on [npm](https://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability) or you can search in [google](https://www.google.com/search?q=ignore-scripts+security) about it.

```bash
yarn config set ignore-scripts true
npm config set ignore-scripts true
```

### Loading process

If you use `fcrypo` directly or indirectly through dependencies, it's required wait loading first. Libraries should not be responsible for this. For example, in project entrypoint:

```js
require('fcrypto').load().then(startApp)
```

## LICENSE

This library is free and open-source software released under the MIT license.
