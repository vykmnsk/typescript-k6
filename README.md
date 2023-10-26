### Setup

yarn install

### Run unit tests

yarn test

### Run load test

yarn webpack && k6 run dist/[test-filename].js

### Run support scripts

ts-node src/scripts/[script-filename].ts
