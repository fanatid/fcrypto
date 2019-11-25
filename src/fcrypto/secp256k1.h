#ifndef FCRYPTO_SECP256K1
#define FCRYPTO_SECP256K1

#include <secp256k1/include/secp256k1.h>

class Secp256k1 {
 private:
  secp256k1_context* ctx_;

 public:
  Secp256k1();
  ~Secp256k1();

  /** Verify an ECDSA secret key.
   *  Returns: 0: secret key is valid
   *           1: secret key is invalid
   */
  int PrivateKeyVerify(const unsigned char* seckey);

  /** Negates a private key in place.
   *  Returns: 0: always
   */
  int PrivateKeyNegate(unsigned char* seckey);

  /** Tweak a private key by adding tweak to it.
   *  Returns: 0: on success
   *           1: the tweak was out of range or if the resulting private key
   * would be invalid
   */
  int PrivateKeyTweakAdd(unsigned char* seckey, const unsigned char* tweak);

  /** Tweak a private key by multiplying it by a tweak.
   *   Returns: 0: on success
   *            1: the tweak was out of range or equal to zero
   */
  int PrivateKeyTweakMul(unsigned char* seckey, const unsigned char* tweak);

  /** Compute the public key for a secret key.
   *  Returns: 0: secret was valid
   *           1: secret was invalid
   */
  int PublicKeyCreate(unsigned char* output,
                      const unsigned char* seckey,
                      bool compressed);

  /** Reserialize public key to another format.
   *  Returns: 0: on success
   *           1: the public key could not be parsed
   */
  int PublicKeyConvert(unsigned char* output,
                       const unsigned char* input,
                       size_t inputlen,
                       bool compressed);

  /** Negates a public key in place.
   *  Returns: 0: on success
   *           1: the public key could not be parsed
   */
  int PublicKeyNegate(unsigned char* output,
                      const unsigned char* input,
                      size_t inputlen,
                      bool compressed);

  /** Add a number of public keys together.
   *  Returns: 0: the sum of the public keys is valid
   *           1: one of the public keys could not be parsed
   *           2: the sum of the public keys is not valid
   */
  int PublicKeyCombine(unsigned char* output,
                       const unsigned char* const* inputs,
                       const size_t* inputslen,
                       size_t n,
                       bool compressed);

  /** Tweak a public key by adding tweak times the generator to it.
   *  Returns: 0: on success
   *           1: the public key could not be parsed
   *           2: the tweak was out of range or if the resulting public key
   * would be invalid
   */
  int PublicKeyTweakAdd(unsigned char* output,
                        const unsigned char* input,
                        size_t inputlen,
                        const unsigned char* tweak,
                        bool compressed);

  /** Tweak a public key by multiplying it by a tweak value.
   *  Returns: 0: on success
   *           1: the public key could not be parsed
   *           2: the tweak was out of range or equal to zero
   */
  int PublicKeyTweakMul(unsigned char* output,
                        const unsigned char* input,
                        size_t inputlen,
                        const unsigned char* tweak,
                        bool compressed);

  /** Convert a signature to a normalized lower-S form in place.
   *  Returns: 0: on success
   *           1: signature could not be parsed
   */
  int SignatureNormalize(unsigned char* sig);

  /** Export an ECDSA signature to DER format.
   *  Returns: 0: on success
   *           1: signature could not be parsed
   */
  int SignatureExport(unsigned char* output72,
                      size_t* outputlen,
                      const unsigned char* input64);

  /** Parse a DER ECDSA signature.
   *  Returns: 0: on success
   *           1: signature could not be parsed
   */
  int SignatureImport(unsigned char* output64,
                      const unsigned char* input,
                      size_t inputlen);

  // TODO: add custom function & data
  /** Create an ECDSA signature.
   *  Returns: 0: signature created
   *           1: the nonce generation function failed, or the private key was
   * invalid
   */
  int ECDSASign(unsigned char* sig,
                int* recid,
                const unsigned char* msg32,
                const unsigned char* seckey);

  /** Verify an ECDSA signature.
   *  Returns: 0: correct signature
   *           1: signature could not be parsed
   *           2: the public key could not be parsed
   *           3: incorrect or unparseable signature
   */
  int ECDSAVerify(const unsigned char* sig,
                  const unsigned char* msg32,
                  const unsigned char* input,
                  size_t inputlen);

  /** Recover an ECDSA public key from a signature.
   *  Returns: 0: public key successfully recovered (which guarantees a correct
   * signature)
   *           1: signature could not be parsed 2: otherwise
   */
  int ECDSARecover(unsigned char* output,
                   const unsigned char* sig,
                   int recid,
                   const unsigned char* msg32,
                   bool compressed);

  /** Compute an EC Diffie-Hellman secret in constant time.
   *  Returns: 0: exponentiation was successful
   *           1: the public key could not be parsed
   *           2: scalar was invalid (zero or overflow)
   */
  int ECDH(unsigned char* output,
           const unsigned char* input,
           size_t inputlen,
           const unsigned char* seckey);

  /** Compute an EC Diffie-Hellman secret in constant time and return public
   * key as result.
   *  Returns: 0: exponentiation was successful
   *           1: the public key could not be parsed
   *           2: scalar was invalid (zero or overflow)
   */
  int ECDHUnsafe(unsigned char* output,
                 const unsigned char* input,
                 size_t inputlen,
                 const unsigned char* seckey,
                 bool compressed);
};

#endif  // FCRYPTO_SECP256K1
