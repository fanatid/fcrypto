#include <addon/secp256k1.h>
#include <addon/util.h>

#include <fcrypto/secp256k1.h>
#include <napi.h>

// TODO: change to ObjectWrap and add finalizer
Secp256k1* secp256k1;

// PrivateKey
Napi::Value PrivateKeyVerify(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<const unsigned char>>().Data();
  int isValid = secp256k1->PrivateKeyVerify(seckey);
  return Napi::Boolean::New(info.Env(), (bool)isValid);
}

Napi::Value PrivateKeyNegate(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value PrivateKeyTweakAdd(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value PrivateKeyTweakMul(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

// PublicKey
Napi::Value PublicKeyCreate(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto seckey = info[1].As<Napi::Buffer<const unsigned char>>().Data();
  auto compressed = info[2].As<Napi::Boolean>().Value();

  int ret = secp256k1->PublicKeyCreate(output, seckey, compressed);
  return Napi::Number::New(info.Env(), ret);
}

Napi::Value PublicKeyConvert(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value PublicKeyNegate(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value PublicKeyCombine(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value PublicKeyTweakAdd(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value PublicKeyTweakMul(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

// Signature
Napi::Value SignatureNormalize(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value SignatureExport(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value SignatureImport(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

// ECDSA
Napi::Value ECDSASign(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value ECDSAVerify(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value ECDSARecover(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

// ECDH
Napi::Value ECDH(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Value ECDHUnsafe(const Napi::CallbackInfo& info) {
  return info.Env().Null();
}

Napi::Object InitSecp256k1(Napi::Env env) {
  // Initialize secp256k1 in fcrypto
  secp256k1 = new Secp256k1();

  // PrivateKey
  Napi::Object privateKey = Napi::Object::New(env);
  SET_FUNCTION(env, privateKey, "verify", PrivateKeyVerify);
  SET_FUNCTION(env, privateKey, "negate", PrivateKeyNegate);
  Napi::Object stweak = Napi::Object::New(env);
  SET_FUNCTION(env, stweak, "add", PrivateKeyTweakAdd);
  SET_FUNCTION(env, stweak, "mul", PrivateKeyTweakMul);
  privateKey.Set(Napi::String::New(env, "tweak"), stweak);

  // PublicKey
  Napi::Object publicKey = Napi::Object::New(env);
  SET_FUNCTION(env, publicKey, "create", PublicKeyCreate);
  SET_FUNCTION(env, publicKey, "convert", PublicKeyConvert);
  SET_FUNCTION(env, publicKey, "negate", PublicKeyNegate);
  SET_FUNCTION(env, publicKey, "combine", PublicKeyCombine);
  Napi::Object ptweak = Napi::Object::New(env);
  SET_FUNCTION(env, ptweak, "add", PublicKeyTweakAdd);
  SET_FUNCTION(env, ptweak, "mul", PublicKeyTweakMul);
  publicKey.Set(Napi::String::New(env, "tweak"), ptweak);

  // Signature
  Napi::Object signature = Napi::Object::New(env);
  SET_FUNCTION(env, signature, "normalize", SignatureNormalize);
  SET_FUNCTION(env, signature, "export", SignatureExport);
  SET_FUNCTION(env, signature, "import", SignatureImport);

  // ECDSA
  Napi::Object ecdsa = Napi::Object::New(env);
  SET_FUNCTION(env, ecdsa, "sign", ECDSASign);
  SET_FUNCTION(env, ecdsa, "verify", ECDSAVerify);
  SET_FUNCTION(env, ecdsa, "recover", ECDSARecover);

  // ECDH
  Napi::Function ecdh = Napi::Function::New(env, ECDH, "ecdh");
  SET_FUNCTION(env, ecdh, "unsafe", ECDHUnsafe);

  // Export
  Napi::Object exports = Napi::Object::New(env);
  exports.Set(Napi::String::New(env, "privateKey"), privateKey);
  exports.Set(Napi::String::New(env, "publicKey"), publicKey);
  exports.Set(Napi::String::New(env, "signature"), signature);
  exports.Set(Napi::String::New(env, "ecdsa"), ecdsa);
  exports.Set(Napi::String::New(env, "ecdh"), ecdh);
  return exports;
}
