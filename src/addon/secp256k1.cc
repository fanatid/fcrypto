#include <addon/secp256k1.h>

#define RET(result) return Napi::Number::New(info.Env(), result);

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
          InstanceMethod("publicKeyConvert", &Secp256k1Addon::PublicKeyConvert),
          InstanceMethod("publicKeyNegate", &Secp256k1Addon::PublicKeyNegate),
          InstanceMethod("publicKeyCombine", &Secp256k1Addon::PublicKeyCombine),
          InstanceMethod("publicKeyTweakAdd",
                         &Secp256k1Addon::PublicKeyTweakAdd),
          InstanceMethod("publicKeyTweakMul",
                         &Secp256k1Addon::PublicKeyTweakMul),

          InstanceMethod("signatureNormalize",
                         &Secp256k1Addon::SignatureNormalize),
          InstanceMethod("signatureExport", &Secp256k1Addon::SignatureExport),
          InstanceMethod("signatureImport", &Secp256k1Addon::SignatureImport),

          InstanceMethod("ecdsaSign", &Secp256k1Addon::ECDSASign),
          InstanceMethod("ecdsaVerify", &Secp256k1Addon::ECDSAVerify),
          InstanceMethod("ecdsaRecover", &Secp256k1Addon::ECDSARecover),

          InstanceMethod("ecdh", &Secp256k1Addon::ECDH),
          InstanceMethod("ecdhUnsafe", &Secp256k1Addon::ECDHUnsafe),
      });

  return func.New({});
}

Secp256k1Addon::Secp256k1Addon(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<Secp256k1Addon>(info) {
  ctx_ = fcrypto_secp256k1_context_create();
}

Secp256k1Addon::~Secp256k1Addon() {
  fcrypto_secp256k1_context_destroy(const_cast<secp256k1_context*>(ctx_));
}

// PrivateKey
Napi::Value Secp256k1Addon::PrivateKeyVerify(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_seckey_verify(this->ctx_, seckey));
}

Napi::Value Secp256k1Addon::PrivateKeyNegate(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<unsigned char>>().Data();

  RET(fcrypto_secp256k1_seckey_negate(this->ctx_, seckey));
}

Napi::Value Secp256k1Addon::PrivateKeyTweakAdd(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto tweak = info[1].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_seckey_tweak_add(this->ctx_, seckey, tweak));
}

Napi::Value Secp256k1Addon::PrivateKeyTweakMul(const Napi::CallbackInfo& info) {
  auto seckey = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto tweak = info[1].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_seckey_tweak_mul(this->ctx_, seckey, tweak));
}

// PublicKey
Napi::Value Secp256k1Addon::PublicKeyCreate(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto seckey = info[1].As<Napi::Buffer<const unsigned char>>().Data();
  int compressed = info[2].As<Napi::Boolean>().Value() ? 1 : 0;

  RET(fcrypto_secp256k1_pubkey_create(this->ctx_, output, seckey, compressed));
}

Napi::Value Secp256k1Addon::PublicKeyConvert(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::PublicKeyNegate(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::PublicKeyCombine(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::PublicKeyTweakAdd(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::PublicKeyTweakMul(const Napi::CallbackInfo& info) {
  RET(0);
}

// Signature
Napi::Value Secp256k1Addon::SignatureNormalize(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::SignatureExport(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::SignatureImport(const Napi::CallbackInfo& info) {
  RET(0);
}

// ECDSA
Napi::Value Secp256k1Addon::ECDSASign(const Napi::CallbackInfo& info) {
  auto env = info.Env();

  auto obj = info[0].As<Napi::Object>();
  auto output = obj.Get(Napi::String::New(env, "signature"))
                    .As<Napi::Buffer<unsigned char>>()
                    .Data();
  int recid;
  auto msg32 = info[1].As<Napi::Buffer<unsigned char>>().Data();
  auto seckey = info[2].As<Napi::Buffer<const unsigned char>>().Data();

  int ret =
      fcrypto_secp256k1_ecdsa_sign(this->ctx_, output, &recid, msg32, seckey);
  if (ret == 0) {
    obj.Set(Napi::String::New(env, "recid"), recid);
  }

  return Napi::Number::New(env, ret);
}

Napi::Value Secp256k1Addon::ECDSAVerify(const Napi::CallbackInfo& info) {
  auto sigraw = info[0].As<Napi::Buffer<const unsigned char>>().Data();
  auto msg32 = info[1].As<Napi::Buffer<const unsigned char>>().Data();
  auto pubkey = info[2].As<Napi::Buffer<const unsigned char>>();

  RET(fcrypto_secp256k1_ecdsa_verify(this->ctx_, sigraw, msg32, pubkey.Data(),
                                     pubkey.Length()));
}

Napi::Value Secp256k1Addon::ECDSARecover(const Napi::CallbackInfo& info) {
  RET(0);
}

// ECDH
Napi::Value Secp256k1Addon::ECDH(const Napi::CallbackInfo& info) {
  RET(0);
}

Napi::Value Secp256k1Addon::ECDHUnsafe(const Napi::CallbackInfo& info) {
  RET(0);
}
