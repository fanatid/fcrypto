#include <fcrypto/secp256k1.h>
#include <secp256k1/include/secp256k1_ecdh.h>
#include <secp256k1/include/secp256k1_preallocated.h>
#include <secp256k1/include/secp256k1_recovery.h>

#include <stdio.h>
#include <stdlib.h>

// TODO: allow set callbacks from JS code?
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

#define RETURN_IF_ZERO(result, retcode)                                        \
  do {                                                                         \
    if (result == 0) {                                                         \
      return retcode;                                                          \
    }                                                                          \
  } while (0)

// TODO: remove everything except retcode?
#define PUBKEY_SERIALIZE(retcode)                                              \
  do {                                                                         \
    int flags =                                                                \
        outputlen == 33 ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED; \
    RETURN_IF_ZERO(secp256k1_ec_pubkey_serialize(                              \
                       ctx, output, &outputlen, &pubkey, flags),               \
                   retcode);                                                   \
  } while (0)

// Context
size_t fcrypto_secp256k1_context_size() {
  return secp256k1_context_preallocated_size(SECP256K1_CONTEXT_SIGN |
                                             SECP256K1_CONTEXT_VERIFY);
}

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
  PUBKEY_SERIALIZE(2);
  return 0;
}

int fcrypto_secp256k1_pubkey_convert(const secp256k1_context* ctx,
                                     unsigned char* output,
                                     const unsigned char* input,
                                     size_t inputlen,
                                     size_t outputlen) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 1);
  PUBKEY_SERIALIZE(2);
  return 0;
}

int fcrypto_secp256k1_pubkey_negate(const secp256k1_context* ctx,
                                    unsigned char* output,
                                    const unsigned char* input,
                                    size_t inputlen,
                                    size_t outputlen) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 1);
  RETURN_IF_ZERO(secp256k1_ec_pubkey_negate(ctx, &pubkey), 2);
  PUBKEY_SERIALIZE(3);
  return 0;
}

// We can not use unique_ptr in C, so no macroses here ¯\_(ツ)_/¯
int fcrypto_secp256k1_pubkey_combine(const secp256k1_context* ctx,
                                     unsigned char* output,
                                     const unsigned char* const* inputs,
                                     const size_t* inputslen,
                                     size_t n,
                                     size_t outputlen) {
  int ret = 0;

  secp256k1_pubkey* pubkeys = calloc(n, sizeof(secp256k1_pubkey));
  const secp256k1_pubkey** ins = calloc(n, sizeof(secp256k1_pubkey*));

  for (unsigned int i = 0; i < n; ++i) {
    if (secp256k1_ec_pubkey_parse(ctx, &pubkeys[i], inputs[i], inputslen[i]) ==
        0) {
      ret = 1;
      goto cleanup;
    }

    ins[i] = &pubkeys[i];
  }

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_combine(ctx, &pubkey, ins, n) == 0) {
    ret = 2;
    goto cleanup;
  }

  int flags =
      outputlen == 33 ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED;
  if (secp256k1_ec_pubkey_serialize(ctx, output, &outputlen, &pubkey, flags) ==
      0) {
    ret = 3;
    goto cleanup;
  }

cleanup:
  free((void*)ins);
  free((void*)pubkeys);

  return ret;
}

int fcrypto_secp256k1_pubkey_tweak_add(const secp256k1_context* ctx,
                                       unsigned char* output,
                                       const unsigned char* input,
                                       size_t inputlen,
                                       const unsigned char* tweak,
                                       size_t outputlen) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 1);
  RETURN_IF_ZERO(secp256k1_ec_pubkey_tweak_add(ctx, &pubkey, tweak), 2);
  PUBKEY_SERIALIZE(3);
  return 0;
}

int fcrypto_secp256k1_pubkey_tweak_mul(const secp256k1_context* ctx,
                                       unsigned char* output,
                                       const unsigned char* input,
                                       size_t inputlen,
                                       const unsigned char* tweak,
                                       size_t outputlen) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 1);
  RETURN_IF_ZERO(secp256k1_ec_pubkey_tweak_mul(ctx, &pubkey, tweak), 2);
  PUBKEY_SERIALIZE(3);
  return 0;
}

// Signature
int fcrypto_secp256k1_signature_normalize(const secp256k1_context* ctx,
                                          unsigned char* sig) {
  secp256k1_ecdsa_signature sigin, sigout;
  RETURN_IF_ZERO(secp256k1_ecdsa_signature_parse_compact(ctx, &sigin, sig), 1);
  secp256k1_ecdsa_signature_normalize(ctx, &sigout, &sigin);
  secp256k1_ecdsa_signature_serialize_compact(ctx, sig, &sigout);
  return 0;
}

int fcrypto_secp256k1_signature_export(const secp256k1_context* ctx,
                                       unsigned char* output72,
                                       size_t* outputlen,
                                       const unsigned char* input64) {
  secp256k1_ecdsa_signature sig;
  RETURN_IF_ZERO(secp256k1_ecdsa_signature_parse_compact(ctx, &sig, input64),
                 1);
  RETURN_IF_ZERO(
      secp256k1_ecdsa_signature_serialize_der(ctx, output72, outputlen, &sig),
      2);
  return 0;
}

int fcrypto_secp256k1_signature_import(const secp256k1_context* ctx,
                                       unsigned char* output64,
                                       const unsigned char* input,
                                       size_t inputlen) {
  secp256k1_ecdsa_signature sig;
  RETURN_IF_ZERO(
      secp256k1_ecdsa_signature_parse_der(ctx, &sig, input, inputlen), 1);
  RETURN_IF_ZERO(
      secp256k1_ecdsa_signature_serialize_compact(ctx, output64, &sig), 2);
  return 0;
}

// ECDSA
// TODO: add custom function & data
int fcrypto_secp256k1_ecdsa_sign(const secp256k1_context* ctx,
                                 unsigned char* output,
                                 int* recid,
                                 const unsigned char* msg32,
                                 const unsigned char* seckey) {
  secp256k1_ecdsa_recoverable_signature sig;
  RETURN_IF_ZERO(
      secp256k1_ecdsa_sign_recoverable(
          ctx, &sig, msg32, seckey, secp256k1_nonce_function_rfc6979, NULL),
      1);

  RETURN_IF_ZERO(secp256k1_ecdsa_recoverable_signature_serialize_compact(
                     ctx, output, recid, &sig),
                 2);
  return 0;
}

int fcrypto_secp256k1_ecdsa_verify(const secp256k1_context* ctx,
                                   const unsigned char* sigraw,
                                   const unsigned char* msg32,
                                   const unsigned char* input,
                                   size_t inputlen) {
  secp256k1_ecdsa_signature sig;
  RETURN_IF_ZERO(secp256k1_ecdsa_signature_parse_compact(ctx, &sig, sigraw), 1);

  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 2);

  RETURN_IF_ZERO(secp256k1_ecdsa_verify(ctx, &sig, msg32, &pubkey), 3);
  return 0;
}

int fcrypto_secp256k1_ecdsa_recover(const secp256k1_context* ctx,
                                    unsigned char* output,
                                    const unsigned char* sigraw,
                                    int recid,
                                    const unsigned char* msg32,
                                    size_t outputlen) {
  secp256k1_ecdsa_recoverable_signature sig;
  RETURN_IF_ZERO(secp256k1_ecdsa_recoverable_signature_parse_compact(
                     ctx, &sig, sigraw, recid),
                 1);

  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ecdsa_recover(ctx, &pubkey, &sig, msg32), 2);

  PUBKEY_SERIALIZE(3);
  return 0;
}

// ECDH
// TODO: add custom function & data
int fcrypto_secp256k1_ecdh(const secp256k1_context* ctx,
                           unsigned char* output,
                           const unsigned char* input,
                           size_t inputlen,
                           const unsigned char* seckey) {
  secp256k1_pubkey pubkey;
  RETURN_IF_ZERO(secp256k1_ec_pubkey_parse(ctx, &pubkey, input, inputlen), 1);
  RETURN_IF_ZERO(secp256k1_ecdh(ctx,
                                output,
                                &pubkey,
                                seckey,
                                secp256k1_ecdh_hash_function_sha256,
                                NULL),
                 2);
  return 0;
}
