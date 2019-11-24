{
  'target_default': {
    'cflags': [
      '-Wall',
      '-Wextra',
    ],
  },
  'targets': [
    {
      'target_name': 'secp256k1',
      'type': 'static_library',
      'sources': [
        'src/secp256k1/src/secp256k1.c',
      ],
      'include_dirs': [
        'src/secp256k1',
        'src/secp256k1/src',
      ],
      'cflags': [
        '-Wno-unused-function',
        '-Wno-nonnull-compare',
      ],
      'defines': [
        # Current default values for desktop (544002c at 24.11.2019)
        'ECMULT_GEN_PREC_BITS=4',
        'ECMULT_WINDOW_SIZE=15',
        # Activate modules
        'ENABLE_MODULE_ECDH=1',
        'ENABLE_MODULE_RECOVERY=1',
        #
        'USE_ENDOMORPHISM=1',
        # Ignore GMP, dynamic linking, so will be hard to use with prebuilds
        'USE_NUM_NONE=1',
        'USE_FIELD_INV_BUILTIN=1',
        'USE_SCALAR_INV_BUILTIN=1',
      ],
      'conditions': [
        ['target_arch=="x64"', {
          'defines': [
            'HAVE___INT128=1',
            'USE_ASM_X86_64=1',
            'USE_FIELD_5X52=1',
            'USE_SCALAR_4X64=1',
          ]
        }, {
          'defines': [
            'USE_FIELD_10X26=1',
            'USE_SCALAR_8X32=1',
          ]
        }],
      ],
    },
    {
      'target_name': 'fcrypto',
      'dependencies': [
        'secp256k1',
      ],
      'sources': [
        'src/addon/main.cc',
        'src/addon/secp256k1.cc',
      ],
      'include_dirs': [
        '<!@(node -p \'require("node-addon-api").include\')',
        'src',
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'defines': [
        'NAPI_VERSION=1',
      ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7',
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      },
    }
  ]
}
