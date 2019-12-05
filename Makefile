.PHONY: all
all: build-wasm


build: build-addon build-wasm


node_gyp = ./node_modules/.bin/node-gyp
node_gyp_opts = -j2 --release

build-addon: build-addon-fcrypto build-addon-copy

build-addon-fcrypto:
	$(node_gyp) configure $(node_gyp_opts) && $(node_gyp) build $(node_gyp_opts)

build-addon-copy:
	util/build-addon-copy.js


build_wasm_dir = build/wasm
build_wasm_dir_js = lib/wasm
build_wasm_opts = -O3

build-wasm: build-wasm-docker-image build-wasm-libs build-wasm-fcrypto build-wasm-copy build-wasm-jsglue

build-wasm-docker-image:
	@if [ "`id -u`" -ne 1000 ] || [ "`id -g`" -ne 1000 ]; then \
		echo 'User id and group id, both should be 1000'; exit 1; \
	else true; fi
	docker build -t fcrypto-build-wasm -f wasm.dockerfile .

build-wasm-libs: build-wasm-secp256k1

build-wasm-secp256k1:
	mkdir -p $(build_wasm_dir)/secp256k1
	rsync -a --delete src/secp256k1/ $(build_wasm_dir)/secp256k1/
	# Definitions from binding.gyp (x32)
	docker run --rm -v `pwd`:`pwd` -w `pwd` -u 1000:1000 fcrypto-build-wasm \
		emcc \
			-o $(build_wasm_dir)/secp256k1.o \
			$(build_wasm_opts) \
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
			-I$(build_wasm_dir)/secp256k1 \
			-I$(build_wasm_dir)/secp256k1/src \
			-Wno-unused-function \
			$(build_wasm_dir)/secp256k1/src/secp256k1.c

build-wasm-fcrypto:
	docker run --rm -v `pwd`:`pwd` -w `pwd` -u 1000:1000 fcrypto-build-wasm \
		emcc \
			-o $(build_wasm_dir)/fcrypto.js \
			$(build_wasm_opts) \
			-g1 \
			-s STRICT=1 \
			-s TOTAL_STACK=1048576 \
			-s TOTAL_MEMORY=16777216 \
			-s ALLOW_MEMORY_GROWTH=0 \
			-s WASM_MEM_MAX=-1 \
			-s WASM_TABLE_SIZE=0 \
			-s ALLOW_TABLE_GROWTH=0 \
			-s INCOMING_MODULE_JS_API='[]' \
			-s ENVIRONMENT='node' \
			-s NODEJS_CATCH_EXIT=0 \
			-s NODEJS_CATCH_REJECTION=0 \
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
			$(build_wasm_dir)/secp256k1.o \
			src/fcrypto/secp256k1.c

build-wasm-copy:
	# copy wasm file
	cp -u $(build_wasm_dir)/fcrypto.wasm fcrypto.wasm
	# generate base64 for browser
	util/build-wasm-base64.js \
		-i $(build_wasm_dir)/fcrypto.wasm \
		-o $(build_wasm_dir_js)/bin-browser.js

build-wasm-jsglue:
	util/build-wasm-jsglue.js \
		-i $(build_wasm_dir)/fcrypto.js \
		-o $(build_wasm_dir_js)/glue.js

build-wasm-wat:
	docker run --rm -v `pwd`:`pwd` -w `pwd` -u 1000:1000 fcrypto-build-wasm \
		wasm2wat \
			-o $(build_wasm_dir)/fcrypto.wat \
			$(build_wasm_dir)/fcrypto.wasm


clean:
	rm -rf \
		build/ \
		$(build_wasm_dir_js)/bin-browser.js \
		$(build_wasm_dir_js)/glue.js \
		fcrypto-darwin-x64.node \
		fcrypto-linux-x64.node \
		fcrypto-win32-x64.node
