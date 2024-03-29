#include <addon/secp256k1.h>

#define RET(result) return Napi::Number::New(info.Env(), result);

Napi::FunctionReference Secp256k1Addon::constructor;

Napi::Value Secp256k1Addon::Init(Napi::Env env) {
  Napi::Function func = DefineClass(
      env,
      "Secp256k1Addon",
      {
          InstanceMethod("contextRandomize", &Secp256k1Addon::ContextRandomize),

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
      });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  return func;
}

Secp256k1Addon::Secp256k1Addon(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<Secp256k1Addon>(info) {
  ctx_ = fcrypto_secp256k1_context_create();

  size_t size = fcrypto_secp256k1_context_size();
  Napi::MemoryManagement::AdjustExternalMemory(info.Env(), size);
}

void Secp256k1Addon::Finalize(Napi::Env env) {
  fcrypto_secp256k1_context_destroy(const_cast<secp256k1_context*>(ctx_));

  size_t size = fcrypto_secp256k1_context_size();
  Napi::MemoryManagement::AdjustExternalMemory(env, -size);
}

Napi::Value Secp256k1Addon::ContextRandomize(const Napi::CallbackInfo& info) {
  const unsigned char* seed32 = NULL;
  if (!info[0].IsNull()) {
    seed32 = info[0].As<Napi::Buffer<const unsigned char>>().Data();
  }

  RET(fcrypto_secp256k1_context_randomize(
      const_cast<secp256k1_context*>(this->ctx_), seed32));
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
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto seckey = info[1].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_pubkey_create(
      this->ctx_, output.Data(), seckey, output.Length()));
}

Napi::Value Secp256k1Addon::PublicKeyConvert(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto pubkey = info[1].As<Napi::Buffer<const unsigned char>>();

  RET(fcrypto_secp256k1_pubkey_convert(this->ctx_,
                                       output.Data(),
                                       pubkey.Data(),
                                       pubkey.Length(),
                                       output.Length()));
}

Napi::Value Secp256k1Addon::PublicKeyNegate(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto pubkey = info[1].As<Napi::Buffer<const unsigned char>>();

  RET(fcrypto_secp256k1_pubkey_negate(this->ctx_,
                                      output.Data(),
                                      pubkey.Data(),
                                      pubkey.Length(),
                                      output.Length()));
}

Napi::Value Secp256k1Addon::PublicKeyCombine(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto pubkeys = info[1].As<Napi::Array>();

  std::unique_ptr<const unsigned char*[]> inputs(
      new const unsigned char*[pubkeys.Length()]);
  std::unique_ptr<size_t[]> inputslen(new size_t[pubkeys.Length()]);
  for (size_t i = 0; i < pubkeys.Length(); ++i) {
    auto pubkey = pubkeys.Get(i).As<Napi::Buffer<const unsigned char>>();
    inputs[i] = pubkey.Data();
    inputslen[i] = pubkey.Length();
  }

  RET(fcrypto_secp256k1_pubkey_combine(this->ctx_,
                                       output.Data(),
                                       inputs.get(),
                                       inputslen.get(),
                                       pubkeys.Length(),
                                       output.Length()));
}

Napi::Value Secp256k1Addon::PublicKeyTweakAdd(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto pubkey = info[1].As<Napi::Buffer<const unsigned char>>();
  auto tweak = info[2].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_pubkey_tweak_add(this->ctx_,
                                         output.Data(),
                                         pubkey.Data(),
                                         pubkey.Length(),
                                         tweak,
                                         output.Length()));
}

Napi::Value Secp256k1Addon::PublicKeyTweakMul(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto pubkey = info[1].As<Napi::Buffer<const unsigned char>>();
  auto tweak = info[2].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_pubkey_tweak_mul(this->ctx_,
                                         output.Data(),
                                         pubkey.Data(),
                                         pubkey.Length(),
                                         tweak,
                                         output.Length()));
}

// Signature
Napi::Value Secp256k1Addon::SignatureNormalize(const Napi::CallbackInfo& info) {
  auto sig = info[0].As<Napi::Buffer<unsigned char>>().Data();

  RET(fcrypto_secp256k1_signature_normalize(this->ctx_, sig));
}

Napi::Value Secp256k1Addon::SignatureExport(const Napi::CallbackInfo& info) {
  auto obj = info[0].As<Napi::Object>();
  auto output = obj.Get("output").As<Napi::Buffer<unsigned char>>().Data();
  size_t outputlen = 72;
  auto sig = info[1].As<Napi::Buffer<const unsigned char>>().Data();

  int ret =
      fcrypto_secp256k1_signature_export(this->ctx_, output, &outputlen, sig);
  if (ret == 0) {
    obj.Set("outputlen", outputlen);
  }

  RET(ret);
}

Napi::Value Secp256k1Addon::SignatureImport(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto sig = info[1].As<Napi::Buffer<const unsigned char>>();

  RET(fcrypto_secp256k1_signature_import(
      this->ctx_, output, sig.Data(), sig.Length()));
}

// ECDSA
Napi::Value Secp256k1Addon::ECDSASign(const Napi::CallbackInfo& info) {
  auto obj = info[0].As<Napi::Object>();
  auto output = obj.Get("signature").As<Napi::Buffer<unsigned char>>().Data();
  int recid;
  auto msg32 = info[1].As<Napi::Buffer<unsigned char>>().Data();
  auto seckey = info[2].As<Napi::Buffer<const unsigned char>>().Data();

  int ret =
      fcrypto_secp256k1_ecdsa_sign(this->ctx_, output, &recid, msg32, seckey);
  if (ret == 0) {
    obj.Set("recid", recid);
  }

  RET(ret);
}

Napi::Value Secp256k1Addon::ECDSAVerify(const Napi::CallbackInfo& info) {
  auto sigraw = info[0].As<Napi::Buffer<const unsigned char>>().Data();
  auto msg32 = info[1].As<Napi::Buffer<const unsigned char>>().Data();
  auto pubkey = info[2].As<Napi::Buffer<const unsigned char>>();

  RET(fcrypto_secp256k1_ecdsa_verify(
      this->ctx_, sigraw, msg32, pubkey.Data(), pubkey.Length()));
}

Napi::Value Secp256k1Addon::ECDSARecover(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>();
  auto sig = info[1].As<Napi::Buffer<const unsigned char>>().Data();
  auto recid = info[2].As<Napi::Number>().Int32Value();
  auto msg32 = info[3].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_ecdsa_recover(
      this->ctx_, output.Data(), sig, recid, msg32, output.Length()));
}

// ECDH
Napi::Value Secp256k1Addon::ECDH(const Napi::CallbackInfo& info) {
  auto output = info[0].As<Napi::Buffer<unsigned char>>().Data();
  auto pubkey = info[1].As<Napi::Buffer<const unsigned char>>();
  auto seckey = info[2].As<Napi::Buffer<const unsigned char>>().Data();

  RET(fcrypto_secp256k1_ecdh(
      this->ctx_, output, pubkey.Data(), pubkey.Length(), seckey));
}
