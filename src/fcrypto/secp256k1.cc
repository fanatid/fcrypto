#include <fcrypto/secp256k1.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>

// Local helpers
#define RESULT_ASSERT1(fn)                                                     \
  if (fn != 1) {                                                               \
    fprintf(stderr, "[fcrypto] libsecp256k1 function should always return 1"); \
    abort();                                                                   \
  }

#define PUBKEY_SERIALIZE_WITH_RETURN0(output, pubkey, compressed)          \
  {                                                                        \
    size_t outputlen = compressed ? 33 : 65;                               \
    int flags =                                                            \
        compressed ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED;  \
    RESULT_ASSERT1(secp256k1_ec_pubkey_serialize(ctx_, output, &outputlen, \
                                                 &pubkey, flags));         \
  }                                                                        \
  return 0;

// Constructor & destructor
Secp256k1::Secp256k1() {
  ctx_ = secp256k1_context_create(SECP256K1_CONTEXT_SIGN |
                                  SECP256K1_CONTEXT_VERIFY);
}

Secp256k1::~Secp256k1() {
  secp256k1_context_destroy(ctx_);
}

// PrivateKey
int Secp256k1::PrivateKeyVerify(const unsigned char* seckey) {
  int ret = secp256k1_ec_seckey_verify(ctx_, seckey);
  return ret == 1 ? 0 : 1;
}

int Secp256k1::PrivateKeyNegate(unsigned char* seckey) {
  RESULT_ASSERT1(secp256k1_ec_privkey_negate(ctx_, seckey));
  return 0;
}

int Secp256k1::PrivateKeyTweakAdd(unsigned char* seckey,
                                  const unsigned char* tweak) {
  int ret = secp256k1_ec_privkey_tweak_add(ctx_, seckey, tweak);
  return ret == 1 ? 0 : 1;
}

int Secp256k1::PrivateKeyTweakMul(unsigned char* seckey,
                                  const unsigned char* tweak) {
  int ret = secp256k1_ec_privkey_tweak_mul(ctx_, seckey, tweak);
  return ret == 1 ? 0 : 1;
}

// PublicKey
int Secp256k1::PublicKeyCreate(unsigned char* output,
                               const unsigned char* seckey,
                               bool compressed) {
  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_create(ctx_, &pubkey, seckey) == 0) {
    return 1;
  }

  PUBKEY_SERIALIZE_WITH_RETURN0(output, pubkey, compressed);
}

int Secp256k1::PublicKeyConvert(unsigned char* output,
                                const unsigned char* input,
                                size_t inputlen,
                                bool compressed) {
  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_parse(ctx_, &pubkey, input, inputlen) == 0) {
    return 1;
  }

  PUBKEY_SERIALIZE_WITH_RETURN0(output, pubkey, compressed);
}

int Secp256k1::PublicKeyNegate(unsigned char* output,
                               const unsigned char* input,
                               size_t inputlen,
                               bool compressed) {
  return 0;
}

int Secp256k1::PublicKeyCombine(unsigned char* output,
                                const unsigned char* const* inputs,
                                const size_t* inputslen,
                                size_t n,
                                bool compressed) {
  return 0;
}

int Secp256k1::PublicKeyTweakAdd(unsigned char* output,
                                 const unsigned char* input,
                                 size_t inputlen,
                                 const unsigned char* tweak,
                                 bool compressed) {
  return 0;
}

int Secp256k1::PublicKeyTweakMul(unsigned char* output,
                                 const unsigned char* input,
                                 size_t inputlen,
                                 const unsigned char* tweak,
                                 bool compressed) {
  return 0;
}

// Signature
int Secp256k1::SignatureNormalize(unsigned char* sig) {
  return 0;
}

int Secp256k1::SignatureExport(unsigned char* output72,
                               size_t* outputlen,
                               const unsigned char* input64) {
  return 0;
}

int Secp256k1::SignatureImport(unsigned char* output64,
                               const unsigned char* input,
                               size_t inputlen) {
  return 0;
}

// ECDSA
// TODO: add custom function & data
int Secp256k1::ECDSASign(unsigned char* sig,
                         int* recid,
                         const unsigned char* msg32,
                         const unsigned char* seckey) {
  return 0;
}

int Secp256k1::ECDSAVerify(const unsigned char* sig,
                           const unsigned char* msg32,
                           const unsigned char* input,
                           size_t inputlen) {
  return 0;
}

int Secp256k1::ECDSARecover(unsigned char* output,
                            const unsigned char* sig,
                            int recid,
                            const unsigned char* msg32,
                            bool compressed) {
  return 0;
}

// ECDH
int Secp256k1::ECDH(unsigned char* output,
                    const unsigned char* input,
                    size_t inputlen,
                    const unsigned char* seckey) {
  return 0;
}

int Secp256k1::ECDHUnsafe(unsigned char* output,
                          const unsigned char* input,
                          size_t inputlen,
                          const unsigned char* seckey,
                          bool compressed) {
  return 0;
}
