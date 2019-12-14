## fcrypto examples

- [Secp256k1](#secp256k1)
  - [Create private key](#create-private-key)

#### Secp256k1

##### Create private key

```js
const { randomBytes } = require('crypto')
const fcrypto = await require('fcrypto').load(undefined, { secp256k1: true })

function createPrivateKey () {
  while (true) {
    const privateKey = randomBytes(32)
    if (fcrypto.secp256k1.privateKeyVerify(privateKey)) return privateKey
  }
}
```
