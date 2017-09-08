./scripts/setup.sh --config local.env
source local.env
export CXXFLAGS="${MASON_SANITIZE_CXXFLAGS} -fno-sanitize-recover=all"
export LDFLAGS="${MASON_SANITIZE_LDFLAGS}"


V=1 ./node_modules/.bin/node-pre-gyp rebuild
# core is too big ASAN_OPTIONS=disable_coredump=0:${ASAN_OPTIONS}

LD_PRELOAD=${MASON_LLVM_RT_PRELOAD} ../logbt/bin/logbt -- \
  node ./node_modules/.bin/_mocha test/*.test.js
