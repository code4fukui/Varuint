# Varuint (JavaScript / Deno / ブラウザ)

Varuintは、符号なしVarint（LEB128ライク、7ビット + 継続ビット）のエンコードおよびデコードの実装です。DenoやブラウザからURLインポートで直接使用できます。

## 機能

- `Varuint.encode(n)` → `Uint8Array`
- `Varuint.decode(bin, offset=0, wantBigInt=false)` → `number` または `BigInt`
- `Varuint.length(n)` → 必要なバイト長

## 使い方

### ブラウザ / Deno (ESM)

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

`n`をvaruintとして表現するために必要なバイト数を返します。

```js
console.log(Varuint.length(0));      // 1
console.log(Varuint.length(128));    // 2
```

### `Varuint.encode(n)`

`n`（`number`または`BigInt`）を`Uint8Array`にエンコードします。

```js
console.log(Varuint.encode(300)); // Uint8Array [172, 2]
```

### `Varuint.decode(bin, offset = 0, wantBigInt = false)`

`bin`からvaruintをデコードします。デフォルトでは`number`を返し、`wantBigInt=true`の場合は`BigInt`を返します。

```js
const buf = new Uint8Array([9, 9, 172, 2, 9]);
console.log(Varuint.decode(buf, 2));        // 300
console.log(Varuint.decode(buf, 2, true));  // 300n
```

## フォーマット

- 最下位ビットから7ビットずつ格納します。
- 後続のバイトがある場合、継続ビット（MSB）に1がセットされます。
- 最後のバイトのMSBには0がセットされます。

例: `300` → `0xAC 0x02`

## テスト

```sh
deno test
```

## ライセンス

MIT License — [LICENSE](LICENSE)を参照してください。
