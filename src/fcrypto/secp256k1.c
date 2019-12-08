#include <fcrypto/secp256k1.h>
#include <secp256k1/include/secp256k1_recovery.h>

#include <stdio.h>
#include <stdlib.h>

// TODO: allow set callbacks from JS code
// We define USE_EXTERNAL_DEFAULT_CALLBACKS only for WASM, see binding.gyp
#ifdef __EMSCRIPTEN__
void secp256k1_default_illegal_callback_fn(const char* str, void* data) {
  (void)str;
  (void)data;
};

void secp256k1_default_error_callback_fn(const char* str, void* data) {
  (void)str;
  (void)data;
};
#endif

// Local helpers
#define RETURN_INVERTED(result) return result == 1 ? 0 : 1

#define RETURN_IF_ZERO(result, retcode) \
  do {                                  \
    if (result == 0) {                  \
      return retcode;                   \
    }                                   \
  } while (0)

#define PUBKEY_SERIALIZE(ctx, output, pubkey, outputlen, retcode)              \
  do {                                                                         \
    int flags =                                                                \
        outputlen == 33 ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED; \
    RETURN_IF_ZERO(                                                            \
        secp256k1_ec_pubkey_serialize(ctx, output, &outputlen, pubkey, flags), \
        retcode);                                                              \
  } while (0)

// Context
secp256k1_context* fcrypto_secp256k1_context_create() {
  return secp256k1_context_create(SECP256K1_CONTEXT_SIGN |
                                  SECP256K1_CONTEXT_VERIFY);
};

void fcrypto_secp256k1_context_destroy(secp256k1_context* ctx) {
  return secp256k1_context_destroy(ctx);
};

int fcrypto_secp256k1_context_randomize(secp256k1_context* ctx,
                                        const unsigned char* seed32) {
  RETURN_INVERTED(secp256k1_context_randomize(ctx, seed32));
}

// PrivateKey
int fcrypto_secp256k1_seckey_verify(const secp256k1_context* ctx,
                                    const unsigned char* seckey) {
  RETURN_INVERTED(secp256k1_ec_seckey_verify(ctx, seckey));
}

int fcrypto_secp256k1_seckey_negate(const secp256k1_context* ctx,
                                    unsigned char* seckey) {
  RETURN_IF_ZERO(secp256k1_ec_privkey_negate(ctx, seckey), 1);
  return 0;
}

int fcrypto_secp256k1_seckey_tweak_add(const secp256k1_context* ctx,
                                       unsigned char* seckey,
                                       const unsigned char* tweak) {
  RETURN_INVERTED(secp256k1_ec_privkey_tweak_add(ctx, seckey, tweak));
}

int fcrypto_secp256k1_seckey_tweak_mul(const secp256k1_context* ctx,
                                       unsigned char* seckey,
                                       const unsigned char* tweak) {
  RETURN_INVERTED(secp256k1_ec_privkey_tweak_mul(ctx, seckey, tweak));
}

// PublicKey
int fcrypto_secp256k1_pubkey_create(const secp256k1_context* ctx,
                                    unsigned char* output,
                                    const unsigned char* seckey,
                                    size_t outputlen) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_create(ctx, &pubkey, seckey), 1);
  PUBKEY_SERIALIZE(ctx, output, &pubkey, outputlen, 2);
  return 0;
}

int fcrypto_secp256k1_pubkey_convert(const secp256k1_context* ctx,
                                     unsigned char* output,
                                     const unsigned char* input,
                                     size_t inputlen,
                                     size_t outputlen) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 1);
  PUBKEY_SERIALIZE(ctx, output, &pubkey, outputlen, 2);
  return 0;
}

// int fcrypto_secp256k1_pubkey_negate(const secp256k1_context* ctx,
//                                     unsigned char* output,
//                                     const unsigned char* input,
//                                     size_t inputlen,
//                                     size_t outputlen) {
//   return 0;
// }

// int fcrypto_secp256k1_pubkey_combine(const secp256k1_context* ctx,
//                                      unsigned char* output,
//                                      const unsigned char* const* inputs,
//                                      const size_t* inputslen,
//                                      size_t n,
//                                      size_t outputlen) {
//   return 0;
// }

// int fcrypto_secp256k1_pubkey_tweak_add(const secp256k1_context* ctx,
//                                        unsigned char* output,
//                                        const unsigned char* input,
//                                        size_t inputlen,
//                                        const unsigned char* tweak,
//                                        size_t outputlen) {
//   return 0;
// }

// int fcrypto_secp256k1_pubkey_tweak_mul(const secp256k1_context* ctx,
//                                        unsigned char* output,
//                                        const unsigned char* input,
//                                        size_t inputlen,
//                                        const unsigned char* tweak,
//                                        size_t outputlen) {
//   return 0;
// }

// // Signature
// int fcrypto_secp256k1_signature_normalize(const secp256k1_context* ctx,
//                                           unsigned char* sig) {
//   return 0;
// }

// int fcrypto_secp256k1_signature_export(const secp256k1_context* ctx,
//                                        unsigned char* output72,
//                                        size_t* outputlen,
//                                        const unsigned char* input64) {
//   return 0;
// }

// int fcrypto_secp256k1_signature_import(const secp256k1_context* ctx,
//                                        unsigned char* output64,
//                                        const unsigned char* input,
//                                        size_t inputlen) {
//   return 0;
// }

// // ECDSA
// // TODO: add custom function & data
int fcrypto_secp256k1_ecdsa_sign(const secp256k1_context* ctx,
                                 unsigned char* output,
                                 int* recid,
                                 const unsigned char* msg32,
                                 const unsigned char* seckey) {
  secp256k1_ecdsa_recoverable_signature sig;
  RETURN_IF_ZERO(
      secp256k1_ecdsa_sign_recoverable(ctx, &sig, msg32, seckey,
                                       secp256k1_nonce_function_rfc6979, NULL),
      1);

  secp256k1_ecdsa_recoverable_signature_serialize_compact(ctx, output, recid,
                                                          &sig);
  return 0;
}

int fcrypto_secp256k1_ecdsa_verify(const secp256k1_context* ctx,
                                   const unsigned char* sigraw,
                                   const unsigned char* msg32,
                                   const unsigned char* input,
                                   size_t inputlen) {
  secp256k1_ecdsa_signature sig;
  RETURN_IF_ZERO(secp256k1_ecdsa_signature_parse_compact(ctx, &sig, sigraw), 1);

  secp256k1_pubkey public_key;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &public_key, input, inputlen),
                 2);

  RETURN_IF_ZERO(secp256k1_ecdsa_verify(ctx, &sig, msg32, &public_key), 3);
  return 0;
}

// int fcrypto_secp256k1_ecdsa_recover(const secp256k1_context* ctx,
//                                     unsigned char* output,
//                                     const unsigned char* sig,
//                                     int recid,
//                                     const unsigned char* msg32,
//                                     size_t outputlen) {
//   return 0;
// }

// // ECDH
// int fcrypto_secp256k1_ecdh(const secp256k1_context* ctx,
//                            unsigned char* output,
//                            const unsigned char* input,
//                            size_t inputlen,
//                            const unsigned char* seckey) {
//   return 0;
// }

// int fcrypto_secp256k1_ecdh_unsafe(const secp256k1_context* ctx,
//                                   unsigned char* output,
//                                   const unsigned char* input,
//                                   size_t inputlen,
//                                   const unsigned char* seckey,
//                                   size_t outputlen) {
//   return 0;
// }
