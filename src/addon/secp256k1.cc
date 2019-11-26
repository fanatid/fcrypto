#include <addon/secp256k1.h>

#define RET(FnCall) \
  return Napi::Number::New(info.Env(), this->secp256k1_->FnCall);

Napi::Value Secp256k1Addon::New(Napi::Env env) {
  Napi::Function func = DefineClass(
      env, "Secp256k1Addon",
      {
          InstanceMethod("privateKeyVerify", &Secp256k1Addon::PrivateKeyVerify),
          InstanceMethod("privateKeyNegate", &Secp256k1Addon::PrivateKeyNegate),
          InstanceMethod("privateKeyTweakAdd",
                         &Secp256k1Addon::PrivateKeyTweakAdd),
          InstanceMethod("privateKeyTweakMul",
                         &Secp256k1Addon::PrivateKeyTweakMul),

          InstanceMethod("publicKeyCreate", &Secp256k1Addon::PublicKeyCreate),
      });

  return func.New({});
}

Secp256k1Addon::Secp256k1Addon(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<Secp256k1Addon>(info) {
  secp256k1_ = new Secp256k1();
}

Secp256k1Addon::~Secp256k1Addon() {
  delete secp256k1_;
}

// PrivateKey
Napi::Value Secp256k1Addon::PrivateKeyVerify(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<const unsigned char>>().Data();

  RET(PrivateKeyVerify(seckey));
}

Napi::Value Secp256k1Addon::PrivateKeyNegate(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<unsigned char>>().Data();

  RET(PrivateKeyNegate(seckey));
}

Napi::Value Secp256k1Addon::PrivateKeyTweakAdd(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto tweak = info[1].As<Napi::Buffer<const unsigned char>>().Data();

  RET(PrivateKeyTweakAdd(seckey, tweak));
}

Napi::Value Secp256k1Addon::PrivateKeyTweakMul(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto tweak = info[1].As<Napi::Buffer<const unsigned char>>().Data();

  RET(PrivateKeyTweakAdd(seckey, tweak));
}

// PublicKey
Napi::Value Secp256k1Addon::PublicKeyCreate(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto seckey = info[1].As<Napi::Buffer<const unsigned char>>().Data();
  auto compressed = info[2].As<Napi::Boolean>().Value();

  RET(PublicKeyCreate(output, seckey, compressed));
}

// Napi::Value PublicKeyConvert(const Napi::CallbackInfo& info);
// Napi::Value PublicKeyNegate(const Napi::CallbackInfo& info);
// Napi::Value PublicKeyCombine(const Napi::CallbackInfo& info);
// Napi::Value PublicKeyTweakAdd(const Napi::CallbackInfo& info);
// Napi::Value PublicKeyTweakMul(const Napi::CallbackInfo& info);

// Napi::Value SignatureNormalize(const Napi::CallbackInfo& info);
// Napi::Value SignatureExport(const Napi::CallbackInfo& info);
// Napi::Value SignatureImport(const Napi::CallbackInfo& info);

// Napi::Value ECDSASign(const Napi::CallbackInfo& info);
// Napi::Value ECDSAVerify(const Napi::CallbackInfo& info);
// Napi::Value ECDSARecover(const Napi::CallbackInfo& info);

// Napi::Value ECDH(const Napi::CallbackInfo& info);
// Napi::Value ECDHUnsafe(const Napi::CallbackInfo& info);
