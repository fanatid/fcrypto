#include <addon/secp256k1.h>

#include <napi.h>
#include <secp256k1/include/secp256k1.h>

secp256k1_context* secp256k1ctx;

Napi::Value PrivateKeyVerify(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<const unsigned char>>().Data();
  int isValid = secp256k1_ec_seckey_verify(secp256k1ctx, seckey);
  return Napi::Boolean::New(info.Env(), (bool)isValid);
}

Napi::Value PublicKeyCreate(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  auto seckey = info[0].As<Napi::Buffer<const unsigned char>>().Data();
  auto compressed = info[1].As<Napi::Boolean>().Value();
  auto output = info[2].As<Napi::Buffer<unsigned char>>().Data();

  secp256k1_pubkey pubkey;
  if (secp256k1_ec_pubkey_create(secp256k1ctx, &pubkey, seckey) == 0) {
    return Napi::Number::New(env, 1);
  }

  size_t outputlen = compressed ? 33 : 65;
  int flags = compressed ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED;
  secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &outputlen, &pubkey,
                                flags);

  return Napi::Number::New(env, 0);
}

Napi::Object InitSecp256k1(Napi::Env env) {
  // Initialize secp256k1 context
  secp256k1ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN |
                                          SECP256K1_CONTEXT_VERIFY);

  // PrivateKey
  Napi::Object privateKey = Napi::Object::New(env);
  privateKey.Set(Napi::String::New(env, "verify"),
                 Napi::Function::New(env, PrivateKeyVerify, "verify"));

  // PublicKey
  Napi::Object publicKey = Napi::Object::New(env);
  publicKey.Set(Napi::String::New(env, "create"),
                Napi::Function::New(env, PublicKeyCreate, "create"));

  // Signature

  // ECDSA

  // ECDH

  // Export
  Napi::Object exports = Napi::Object::New(env);
  exports.Set(Napi::String::New(env, "privateKey"), privateKey);
  exports.Set(Napi::String::New(env, "publicKey"), publicKey);
  return exports;
}
