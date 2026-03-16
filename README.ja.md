# Varuint

Varuintは、Unsigned Varint（LEB128風、7bitごと＋継続ビット）のエンコード/デコード実装です。Deno / ブラウザのURL importでそのまま使えます。

## 機能
- `Varuint.encode(n)` → `Uint8Array`
- `Varuint.decode(bin, offset=0, wantBigInt=false)` → `number` または（`wantBigInt=true`のとき）`BigInt`
- `Varuint.length(n)` → 必要なバイト長（`number`）

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

## ライセンス
MIT