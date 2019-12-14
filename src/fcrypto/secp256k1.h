#ifndef FCRYPTO_SECP256K1
#define FCRYPTO_SECP256K1

#ifdef __cplusplus
extern "C" {
#endif

#include <secp256k1/include/secp256k1.h>

size_t fcrypto_secp256k1_context_size();
secp256k1_context* fcrypto_secp256k1_context_create();
void fcrypto_secp256k1_context_destroy(secp256k1_context* ctx);

/** Updates the context randomization to protect against side-channel leakage.
 *  Returns: 0: randomization successfully updated or nothing to randomize
 *           1: error
 */
int fcrypto_secp256k1_context_randomize(secp256k1_context* ctx,
                                        const unsigned char* seed32);

/** Verify an ECDSA secret key.
 *  Returns: 0: secret key is valid
 *           1: secret key is invalid
 */
int fcrypto_secp256k1_seckey_verify(const secp256k1_context* ctx,
                                    const unsigned char* seckey);

/** Negates a private key in place.
 *  secp256k1_ec_privkey_negate have WARN_UNUSED_RESULT, so 2 codes
 *  Returns: 0: always
 *           1: never should be returned
 */
int fcrypto_secp256k1_seckey_negate(const secp256k1_context* ctx,
                                    unsigned char* seckey);

/** Tweak a private key by adding tweak to it.
 *  Returns: 0: on success
 *           1: the tweak was out of range or if the resulting private key
 * would be invalid
 */
int fcrypto_secp256k1_seckey_tweak_add(const secp256k1_context* ctx,
                                       unsigned char* seckey,
                                       const unsigned char* tweak);

/** Tweak a private key by multiplying it by a tweak.
 *   Returns: 0: on success
 *            1: the tweak was out of range or equal to zero
 */
int fcrypto_secp256k1_seckey_tweak_mul(const secp256k1_context* ctx,
                                       unsigned char* seckey,
                                       const unsigned char* tweak);

/** Compute the public key for a secret key.
 *  Returns: 0: pubkey successfully created
 *           1: secret was invalid
 *           2: pubkey serialization error
 */
int fcrypto_secp256k1_pubkey_create(const secp256k1_context* ctx,
                                    unsigned char* output,
                                    const unsigned char* seckey,
                                    size_t outputlen);

/** Reserialize public key to another format.
 *  Returns: 0: on success
 *           1: the public key could not be parsed
 *           2: pubkey serialization error
 */
int fcrypto_secp256k1_pubkey_convert(const secp256k1_context* ctx,
                                     unsigned char* output,
                                     const unsigned char* input,
                                     size_t inputlen,
                                     size_t outputlen);

/** Negates a public key in place.
 *  Returns: 0: on success
 *           1: the public key could not be parsed
 *           2: never should be returned
 *           3: pubkey serialization error
 */
int fcrypto_secp256k1_pubkey_negate(const secp256k1_context* ctx,
                                    unsigned char* output,
                                    const unsigned char* input,
                                    size_t inputlen,
                                    size_t outputlen);

/** Add a number of public keys together.
 *  Returns: 0: the sum of the public keys is valid
 *           1: one of the public keys could not be parsed
 *           2: the sum of the public keys is not valid
 *           3: pubkey serialization error
 */
int fcrypto_secp256k1_pubkey_combine(const secp256k1_context* ctx,
                                     unsigned char* output,
                                     const unsigned char* const* inputs,
                                     const size_t* inputslen,
                                     size_t n,
                                     size_t outputlen);

/** Tweak a public key by adding tweak times the generator to it.
 *  Returns: 0: on success
 *           1: the public key could not be parsed
 *           2: the tweak was out of range or if the resulting public key
 * would be invalid
 */
int fcrypto_secp256k1_pubkey_tweak_add(const secp256k1_context* ctx,
                                       unsigned char* output,
                                       const unsigned char* input,
                                       size_t inputlen,
                                       const unsigned char* tweak,
                                       size_t outputlen);

/** Tweak a public key by multiplying it by a tweak value.
 *  Returns: 0: on success
 *           1: the public key could not be parsed
 *           2: the tweak was out of range or equal to zero
 */
int fcrypto_secp256k1_pubkey_tweak_mul(const secp256k1_context* ctx,
                                       unsigned char* output,
                                       const unsigned char* input,
                                       size_t inputlen,
                                       const unsigned char* tweak,
                                       size_t outputlen);

/** Convert a signature to a normalized lower-S form in place.
 *  Returns: 0: on success
 *           1: signature could not be parsed
 */
int fcrypto_secp256k1_signature_normalize(const secp256k1_context* ctx,
                                          unsigned char* sig);

/** Export an ECDSA signature to DER format.
 *  Returns: 0: on success
 *           1: signature could not be parsed
 *           2: not enough space for for serialization
 */
int fcrypto_secp256k1_signature_export(const secp256k1_context* ctx,
                                       unsigned char* output72,
                                       size_t* outputlen,
                                       const unsigned char* input64);

/** Parse a DER ECDSA signature.
 *  Returns: 0: on success
 *           1: signature could not be parsed
 *           2: never should be returned
 */
int fcrypto_secp256k1_signature_import(const secp256k1_context* ctx,
                                       unsigned char* output64,
                                       const unsigned char* input,
                                       size_t inputlen);

/** Create an ECDSA signature.
 *  Returns: 0: signature created
 *           1: the nonce generation function failed, or the private key was
 * invalid
 *           2: never should be returned
 */
int fcrypto_secp256k1_ecdsa_sign(const secp256k1_context* ctx,
                                 unsigned char* output,
                                 int* recid,
                                 const unsigned char* msg32,
                                 const unsigned char* seckey);

/** Verify an ECDSA signature.
 *  Returns: 0: correct signature
 *           1: signature could not be parsed
 *           2: the public key could not be parsed
 *           3: incorrect or unparseable signature
 */
int fcrypto_secp256k1_ecdsa_verify(const secp256k1_context* ctx,
                                   const unsigned char* sigraw,
                                   const unsigned char* msg32,
                                   const unsigned char* input,
                                   size_t inputlen);

/** Recover an ECDSA public key from a signature.
 *  Returns: 0: public key successfully recovered (which guarantees a correct
 * signature)
 *           1: signature could not be parsed
 *           2: public key could not be recover
 *           3: never should be returned
 */
int fcrypto_secp256k1_ecdsa_recover(const secp256k1_context* ctx,
                                    unsigned char* output,
                                    const unsigned char* sig,
                                    int recid,
                                    const unsigned char* msg32,
                                    size_t outputlen);

/** Compute an EC Diffie-Hellman secret in constant time.
 *  Returns: 0: exponentiation was successful
 *           1: the public key could not be parsed
 *           2: scalar was invalid (zero or overflow)
 */
int fcrypto_secp256k1_ecdh(const secp256k1_context* ctx,
                           unsigned char* output,
                           const unsigned char* input,
                           size_t inputlen,
                           const unsigned char* seckey);

#ifdef __cplusplus
}
#endif

#endif  // FCRYPTO_SECP256K1
