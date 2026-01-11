# Varuint (JavaScript / Deno / Browser)

![Varuint logo](Varuint_logo.png)

Unsigned Varint（LEB128風、7bitごと＋継続ビット）のエンコード/デコード実装です。  
Deno / ブラウザの **URL import** でそのまま使えます。

- `Varuint.encode(n)` → `Uint8Array`
- `Varuint.decode(bin, offset=0, wantBigInt=false)` → `number` または（`wantBigInt=true` のとき）`BigInt`
- `Varuint.length(n)` → 必要なバイト長（`number`）

## Import (URL)

### Browser / Deno (ESM)

```js
import { Varuint } from "https://code4fukui.github.io/Varuint/Varuint.js";

const bin = Varuint.encode(300);
console.log(bin); // Uint8Array(2) [172, 2]

const n = Varuint.decode(bin);
console.log(n); // 300
```

## API

### `Varuint.length(n)`

`n` を varuint として表現するのに必要なバイト数を返します。

```js
import { Varuint } from "https://code4fukui.github.io/Varuint/Varuint.js";

console.log(Varuint.length(0));      // 1
console.log(Varuint.length(127));    // 1
console.log(Varuint.length(128));    // 2
console.log(Varuint.length(16384));  // 3
```

### `Varuint.encode(n)`

`n`（`number` または `BigInt`）を `Uint8Array` にエンコードします。

- `number` は **安全な整数（safe integer）** のみ対応  
- より大きい値は `BigInt` を使ってください

```js
import { Varuint } from "https://code4fukui.github.io/Varuint/Varuint.js";

console.log(Varuint.encode(300)); // Uint8Array [172, 2]
console.log(Varuint.encode(0));   // Uint8Array [0]
```

### `Varuint.decode(bin, offset = 0, wantBigInt = false)`

`bin` から varuint をデコードします。

- 返り値は **number**（デフォルト）
- `wantBigInt=true` のとき **BigInt**
- `offset` から読み始めます（複数値が連結されている場合に便利）

```js
import { Varuint } from "https://code4fukui.github.io/Varuint/Varuint.js";

const buf = new Uint8Array([9, 9, 172, 2, 9]);

console.log(Varuint.decode(buf, 2));        // 300
console.log(Varuint.decode(buf, 2, true));  // 300n
```

> 注意: `wantBigInt=false` でデコードした結果が `Number.MAX_SAFE_INTEGER` を超える場合は `RangeError` を投げます。

## Format

- 7bit ずつ下位から格納
- 継続する場合は各バイトの MSB（0x80）を 1 にする
- 最後のバイトは MSB=0

例:

- `300` → `0xAC 0x02`（`[172, 2]`）

## Deno test

```sh
deno test
```

## License

[MIT](LICENSE)
