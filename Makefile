.PHONY: all
all: wasm-build

wasm_build_dir = build/wasm

# Total stack: 1MiB (16 WASM pages, by 64KiB)
# Total memory: 16MiB (256 WASM pages)
# Options after `-O3` for smaller not minified JS file, WASM not affected
wasm_build_opts = -s STRICT=1 \
	-s TOTAL_STACK=1048576 \
	-s TOTAL_MEMORY=16777216 \
	-s ALLOW_MEMORY_GROWTH=0 \
	-s WASM_TABLE_SIZE=0 \
	-s ALLOW_TABLE_GROWTH=0 \
	-O3 \
	-g1 \
	-s INCOMING_MODULE_JS_API='[]' \
	-s ENVIRONMENT='node' \
	-s NODEJS_CATCH_EXIT=0 \
	-s NODEJS_CATCH_REJECTION=0

wasm-build: wasm-build-docker-image wasm-build-secp256k1 wasm-build-fcrypto

wasm-build-docker-image:
	@if [ "`id -u`" -ne 1000 ] || [ "`id -g`" -ne 1000 ]; then \
		echo 'User id and group id, both should be 1000'; exit 1; \
	else true; fi
	docker build -t fcrypto-build-wasm -f wasm.dockerfile .

wasm-build-fcrypto:
	# For debug build, set output file extension to `js`
	# Function names will be minified, but it's possible to see their code in JS file
	docker run --rm -v `pwd`:`pwd` -w `pwd` -u 1000:1000 fcrypto-build-wasm \
		emcc \
			-o $(wasm_build_dir)/fcrypto.wasm \
			$(wasm_build_opts) \
			-s EXPORTED_FUNCTIONS="[ \
				_malloc, \
				_free, \
				_fcrypto_secp256k1_context_create, \
				_fcrypto_secp256k1_context_destroy, \
				_fcrypto_secp256k1_seckey_verify, \
				_fcrypto_secp256k1_seckey_negate, \
				_fcrypto_secp256k1_seckey_tweak_add, \
				_fcrypto_secp256k1_seckey_tweak_mul, \
				_fcrypto_secp256k1_pubkey_create, \
				_fcrypto_secp256k1_pubkey_convert, \
				_fcrypto_secp256k1_ecdsa_sign, \
				_fcrypto_secp256k1_ecdsa_verify \
			]" \
			-Isrc \
			-Wall \
			-Wextra \
			$(wasm_build_dir)/secp256k1.o \
			src/fcrypto/secp256k1.c

wasm-build-secp256k1:
	mkdir -p $(wasm_build_dir)/secp256k1
	rsync -a --delete src/secp256k1/ $(wasm_build_dir)/secp256k1/
	# Definitions from binding.gyp
	docker run --rm -v `pwd`:`pwd` -w `pwd` -u 1000:1000 fcrypto-build-wasm \
		emcc \
			-o $(wasm_build_dir)/secp256k1.o \
			$(wasm_build_opts) \
			-c \
			-D USE_EXTERNAL_DEFAULT_CALLBACKS=1 \
			-D ECMULT_GEN_PREC_BITS=4 \
			-D ECMULT_WINDOW_SIZE=15 \
			-D ENABLE_MODULE_ECDH=1 \
			-D ENABLE_MODULE_RECOVERY=1 \
			-D USE_ENDOMORPHISM=1 \
			-D USE_NUM_NONE=1 \
			-D USE_FIELD_INV_BUILTIN=1 \
			-D USE_SCALAR_INV_BUILTIN=1 \
			-D USE_FIELD_10X26=1 \
			-D USE_SCALAR_8X32=1 \
			-I$(wasm_build_dir)/secp256k1 \
			-I$(wasm_build_dir)/secp256k1/src \
			-Wno-unused-function \
			$(wasm_build_dir)/secp256k1/src/secp256k1.c

wasm-build-wat:
	docker run --rm -v `pwd`:`pwd` -w `pwd` -u 1000:1000 fcrypto-build-wasm \
		wasm2wat \
			-o $(wasm_build_dir)/fcrypto.wat \
			$(wasm_build_dir)/fcrypto.wasm
