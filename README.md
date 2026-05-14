# Varuint (JavaScript / Deno / Browser)

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

Varuint is an implementation of Unsigned Varint (LEB128-like, 7-bit + continuation bit) encoding and decoding. It can be used directly via URL import in Deno and the browser.

## Features

- `Varuint.encode(n)` → `Uint8Array`
- `Varuint.decode(bin, offset=0, wantBigInt=false)` → `number` or `BigInt`
- `Varuint.length(n)` → required byte length

## Usage

### Browser / Deno (ESM)

```js
import { Varuint } from "https://code4fukui.github.io/Varuint/Varuint.js";

const bin = Varuint.encode(300);
console.log(bin); // Uint8Array(2) [172, 2]

const n = Varuint.decode(bin);
console.log(n); // 300
const len = Varuint.length(n);
console.log(len); // 2
```

## API

### `Varuint.length(n)`

Returns the number of bytes required to represent `n` as a varuint.

```js
console.log(Varuint.length(0));      // 1
console.log(Varuint.length(128));    // 2
```

### `Varuint.encode(n)`

Encodes `n` (a `number` or `BigInt`) into a `Uint8Array`.

```js
console.log(Varuint.encode(300)); // Uint8Array [172, 2]
```

### `Varuint.decode(bin, offset = 0, wantBigInt = false)`

Decodes a varuint from `bin`. Returns `number` by default or `BigInt` if `wantBigInt=true`.

```js
const buf = new Uint8Array([9, 9, 172, 2, 9]);
console.log(Varuint.decode(buf, 2));        // 300
console.log(Varuint.decode(buf, 2, true));  // 300n
```

## Format

- Stores 7 bits at a time from the least significant bit.
- Continuation bit (MSB) is set to 1 if more bytes follow.
- Last byte has MSB set to 0.

Example: `300` → `0xAC 0x02`

## Test

```sh
deno test
```

## License

MIT License — see [LICENSE](LICENSE).