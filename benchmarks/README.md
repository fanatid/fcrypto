# fcrypto benchmarks

A lot of people care about performance and there will be a questions why `fcrypo` provide native addons, not just WebAssembly.

- [Init](#init)
- [Secp256k1](#secp256k1)

## Init

Benchmarks require some specific dependencies which `fcrypto` itself not use, so before benchmark anything you need install dependencies:

```bash
yarn install
```

## Secp256k1

If you have `ignore-scripts` set to `true` (which is right), for benchmarking addon from [cryptocoinjs/secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node) you need compile it:

```bash
cd node_modules/secp256k1 && yarn && ./node_modules/.bin/node-gyp rebuild
```

On benchmarking you also can use `SEED` environment which provide same fixtures every time, for example:

```bash
$ SEED=159fe23ead4da17fe30e76706ce16a8d92054664b23da1c021c2f7e54d3e06c7 node secp256k1.js
```

<details>
  <summary>output</summary>

```
Benchmark seed for random data: 159fe23ead4da17fe30e76706ce16a8d92054664b23da1c021c2f7e54d3e06c7
Create 1000 fixtures in 121ms
Benchmarking: secp256k1.publicKeyCreate
--------------------------------------------------
fcrypto/addon x 32,590 ops/sec ±1.45% (94 runs sampled)
fcrypto/wasm x 14,831 ops/sec ±1.29% (96 runs sampled)
secp256k1/addon x 32,831 ops/sec ±1.39% (96 runs sampled)
secp256k1/elliptic x 1,458 ops/sec ±1.37% (94 runs sampled)
secp256k1/js x 1,701 ops/sec ±1.52% (95 runs sampled)
==================================================
Benchmarking: secp256k1.ecdsaSign
--------------------------------------------------
fcrypto/addon x 19,559 ops/sec ±1.32% (95 runs sampled)
fcrypto/wasm x 6,988 ops/sec ±1.40% (94 runs sampled)
secp256k1/addon x 19,555 ops/sec ±1.24% (94 runs sampled)
secp256k1/elliptic x 1,024 ops/sec ±1.60% (91 runs sampled)
secp256k1/js x 1,212 ops/sec ±1.86% (92 runs sampled)
==================================================
Benchmarking: secp256k1.ecdsaVerify
--------------------------------------------------
fcrypto/addon x 16,683 ops/sec ±1.12% (97 runs sampled)
fcrypto/wasm x 6,345 ops/sec ±1.59% (94 runs sampled)
secp256k1/addon x 12,803 ops/sec ±1.34% (96 runs sampled)
secp256k1/elliptic x 444 ops/sec ±2.29% (90 runs sampled)
secp256k1/js x 323 ops/sec ±1.23% (91 runs sampled)
==================================================
Benchmarking: secp256k1.ecdsaRecover
--------------------------------------------------
fcrypto/addon x 15,041 ops/sec ±1.39% (93 runs sampled)
fcrypto/wasm x 6,045 ops/sec ±1.26% (94 runs sampled)
secp256k1/addon x 11,831 ops/sec ±1.47% (97 runs sampled)
secp256k1/elliptic x 431 ops/sec ±2.01% (91 runs sampled)
secp256k1/js x 316 ops/sec ±1.33% (88 runs sampled)
==================================================
Benchmarking: secp256k1.ecdh
--------------------------------------------------
fcrypto/addon x 15,250 ops/sec ±1.46% (94 runs sampled)
fcrypto/wasm x 7,630 ops/sec ±1.28% (95 runs sampled)
secp256k1/addon x 11,998 ops/sec ±1.38% (98 runs sampled)
secp256k1/elliptic x 586 ops/sec ±1.58% (92 runs sampled)
secp256k1/js x 271 ops/sec ±1.30% (91 runs sampled)
==================================================
```
</details>
