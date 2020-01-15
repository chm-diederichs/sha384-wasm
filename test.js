const sha384 = require('./')
const crypto = require('crypto')
const ref = require('js-sha512').sha384
const sodium = require('sodium-native')
const vectors = require('./vectors.json')

// timing benchmark
{
  const buf = Buffer.alloc(8192)
  sodium.randombytes_buf(buf)

  const hash = sha384()
  const jsHash = ref.create()
  const refHash = crypto.createHash('sha384') 

  console.time('wasm')
  for (let i = 0; i < 1000; i++) {
    hash.update(buf)
  }
  const res = hash.digest('hex')
  console.timeEnd('wasm')

  console.time('js')
  for (let i = 0; i < 1000; i++) {
    jsHash.update(buf)
  }
  const jsRes = jsHash.hex()
  console.timeEnd('js')

  console.time('native')
  for (let i = 0; i < 1000; i++) {
    refHash.update(buf)
  }
  const refRes = refHash.digest('hex')
  console.timeEnd('native')

  console.log('\nhashes are consistent: ', res === refRes && res === jsRes)
}

// naive input fuzz
const bugs = []

for (let i = 0; i < 100; i++) {
  const length = Math.floor(2 ** 18 * Math.random())
  const buf = Buffer.alloc(length)
  sodium.randombytes_buf(buf)
  const hash = sha384().update(buf).digest('hex')
  const ref = crypto.createHash('sha384').update(buf).digest('hex')

  if (hash !== ref) bugs.push(length)
}

console.log('\nhashes inconsistent at lengths:', bugs, '\n')

// fuzz multiple updates
const hash = sha384()
const refHash = crypto.createHash('sha384') 

for (let i = 0; i < 100; i++) {  
  const buf = Buffer.alloc(2**16 * Math.random())
  sodium.randombytes_buf(buf)

  hash.update(buf)
  refHash.update(buf)
}

console.log(hash.digest('hex'))
console.log(refHash.digest('hex'))

const failed  = []

for (let vector of vectors) {
  const buf = Buffer.from(vector.input, 'base64')
  const hash = sha384().update(buf).digest('hex')
  if (hash !== vector.hash) failed.push(vector)
}

console.log('\nthese test vectors failed: ', failed)

// several instances updated simultaneously
{
  const hash1 = sha384() 
  const hash2 = sha384()
  const refHash = crypto.createHash('sha384')

  const buf = Buffer.alloc(1024)

  for (let i = 0; i < 10000; i++) {
    sodium.randombytes_buf(buf)
    if (Math.random() < 0.5) {
      hash1.update(buf)
      hash2.update(buf)
    } else {
      hash2.update(buf)
      hash1.update(buf)
    }
    refHash.update(buf)
  }

  const res = refHash.digest('hex')
  const res1 = hash1.digest('hex')
  const res2 = hash2.digest('hex')

  console.log('\nhashes invariant to update order: ', res === res1 && res1 === res2)
}