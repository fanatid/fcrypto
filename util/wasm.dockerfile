# We need custom image for creating wat file on development.

ARG EMSCRIPTEN_VERSION

FROM trzeci/emscripten:${EMSCRIPTEN_VERSION}

RUN git clone --recursive https://github.com/WebAssembly/wabt /wabt \
  && cd /wabt \
  && git checkout $(git describe --tags `git rev-list --tags --max-count=1`) \
  && mkdir build \
  && cd build \
  && cmake -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTS=OFF -DCMAKE_INSTALL_PREFIX=/usr .. \
  && make -j$(nproc) \
  && make install \
  && rm -rf /wabt
