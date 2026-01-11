export class Varuint {
  /**
   * Return required byte length to encode n as varuint.
   * @param {number|bigint} n - unsigned integer
   * @returns {number}
   */
  static length(n) {
    let x = (typeof n === "bigint") ? n : BigInt(n);

    if (x < 0n) throw new RangeError("Varuint.length: n must be unsigned (>= 0)");
    if (typeof n === "number" && !Number.isSafeInteger(n)) {
      throw new RangeError("Varuint.length: number must be a safe integer (use BigInt)");
    }

    // 0 needs exactly 1 byte
    let len = 1;
    while (x >>= 7n) len++;
    return len;
  }

  /**
   * Encode unsigned integer to varuint (LEB128-like).
   * @param {number|bigint} n
   * @returns {Uint8Array}
   */
  static encode(n) {
    let x = (typeof n === "bigint") ? n : BigInt(n);

    if (x < 0n) throw new RangeError("Varuint.encode: n must be unsigned (>= 0)");
    if (typeof n === "number" && !Number.isSafeInteger(n)) {
      throw new RangeError("Varuint.encode: number must be a safe integer (use BigInt)");
    }

    const out = new Uint8Array(Varuint.length(x));
    let i = 0;

    do {
      let byte = Number(x & 0x7Fn);
      x >>= 7n;
      if (x !== 0n) byte |= 0x80;
      out[i++] = byte;
    } while (x !== 0n);

    return out;
  }

  /**
   * Decode varuint from bytes.
   * @param {Uint8Array|ArrayLike<number>} bin
   * @param {number} [offset=0]
   * @param {boolean} [wantBigInt=false]
   * @returns {number|bigint}
   */
  static decode(bin, offset = 0, wantBigInt = false) {
    let x = 0n;
    let shift = 0n;
    let i = offset;

    for (;;) {
      if (i >= bin.length) {
        throw new RangeError("Varuint.decode: truncated input");
      }

      const b = bin[i++] & 0xff;
      x |= BigInt(b & 0x7f) << shift;

      if ((b & 0x80) === 0) break;
      shift += 7n;

      // safety guard (practically unreachable for valid data)
      if (shift > 1024n) {
        throw new RangeError("Varuint.decode: malformed varuint");
      }
    }

    if (wantBigInt) return x;

    if (x > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError(
        "Varuint.decode: value exceeds Number.MAX_SAFE_INTEGER (set wantBigInt=true)"
      );
    }

    return Number(x);
  }
}
