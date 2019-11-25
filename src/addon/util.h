#ifndef ADDON_UTIL
#define ADDON_UTIL

#define SET_FUNCTION(env, obj, name, fn) \
  obj.Set(Napi::String::New(env, name), Napi::Function::New(env, fn, name));

#endif  // ADDON_UTIL
