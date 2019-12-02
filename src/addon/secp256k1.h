#ifndef ADDON_SECP256K1
#define ADDON_SECP256K1

#include <fcrypto/secp256k1.h>
#include <napi.h>

class Secp256k1Addon : public Napi::ObjectWrap<Secp256k1Addon> {
 private:
  const secp256k1_context* ctx_;

 public:
  static Napi::Value New(Napi::Env env);

  Secp256k1Addon(const Napi::CallbackInfo& info);
  ~Secp256k1Addon();

  Napi::Value PrivateKeyVerify(const Napi::CallbackInfo& info);
  Napi::Value PrivateKeyNegate(const Napi::CallbackInfo& info);
  Napi::Value PrivateKeyTweakAdd(const Napi::CallbackInfo& info);
  Napi::Value PrivateKeyTweakMul(const Napi::CallbackInfo& info);

  Napi::Value PublicKeyCreate(const Napi::CallbackInfo& info);
  Napi::Value PublicKeyConvert(const Napi::CallbackInfo& info);
  Napi::Value PublicKeyNegate(const Napi::CallbackInfo& info);
  Napi::Value PublicKeyCombine(const Napi::CallbackInfo& info);
  Napi::Value PublicKeyTweakAdd(const Napi::CallbackInfo& info);
  Napi::Value PublicKeyTweakMul(const Napi::CallbackInfo& info);

  Napi::Value SignatureNormalize(const Napi::CallbackInfo& info);
  Napi::Value SignatureExport(const Napi::CallbackInfo& info);
  Napi::Value SignatureImport(const Napi::CallbackInfo& info);

  Napi::Value ECDSASign(const Napi::CallbackInfo& info);
  Napi::Value ECDSAVerify(const Napi::CallbackInfo& info);
  Napi::Value ECDSARecover(const Napi::CallbackInfo& info);

  Napi::Value ECDH(const Napi::CallbackInfo& info);
  Napi::Value ECDHUnsafe(const Napi::CallbackInfo& info);
};

#endif  // ADDON_SECP256K1
