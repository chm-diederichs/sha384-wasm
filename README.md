# sha384-wasm
## Usage
```js
const sha384 = require('sha384-wasm')

if (!Sha384.SUPPORTED) {
  console.log('WebAssembly not supported by your runtime')
}

var hash = sha384()
  .update('hello')
  .update(' ')
  .update(Buffer.from('world'))
  .digest('hex')

console.log('Sha384 hash of "hello world" is ', hash)
// fdbd8e75a67f29f701a4e040385e2e23986303ea10239211af907fcbb83578b3e417cb71ce646efd0819dd8c088de1bd
```

## API
#### `const hash = sha384()`

Create a new hash instance.

#### `hash.update(data, [enc])`

Update the hash with a new piece of data. `data` may be passed as a buffer, uint8array or a string. If `data` is passed as a string, then it will be interpreted as a `utf8` string unless `enc` specifies an encoding.

#### `hash.digest([enc])`

Digest the hash. If `enc` is specified, then the digest shall be returned as an `enc` encoded string. Otherwise a buffer is returned.

#### `var promise = sha384.ready([cb])`

Option to wait for the WASM code to load. Returns the WebAssembly instance promise as well for convenience.

## Contributing

The bulk of this module is implemented in WebAssembly in the [sha384.wat](sha384.wat) file.
The format of this file is S-Expressions that can be compiled to their binary WASM representation by doing

```
wat2wasm sha384.wat -o sha384.wasm
```

To build the thin Javascript wrapper for the WASM module use `wat2js`:

```
# also available as `npm run compile`
wat2js sha384.wat -o sha384.js
```

If you do not have `wat2wasm` installed follow the instructions here, https://github.com/WebAssembly/wabt

## License

MIT
