#include <addon/secp256k1.h>

#include <napi.h>

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "secp256k1"), Secp256k1Addon::New(env));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
