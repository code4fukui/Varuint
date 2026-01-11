import * as t from "https://deno.land/std/testing/asserts.ts";
import { Varuint } from "./Varuint.js";

Deno.test("simple", () => {
  t.assertEquals(Varuint.encode(300), new Uint8Array([172, 2]));
});

Deno.test("encode basic known vectors", () => {
  // 0
  t.assertEquals(Varuint.encode(0), new Uint8Array([0]));
  // 1 byte max (7 bits)
  t.assertEquals(Varuint.encode(1), new Uint8Array([1]));
  t.assertEquals(Varuint.encode(127), new Uint8Array([127]));
  // 2 bytes min
  t.assertEquals(Varuint.encode(128), new Uint8Array([128, 1]));
  t.assertEquals(Varuint.encode(129), new Uint8Array([129, 1]));
  t.assertEquals(Varuint.encode(16383), new Uint8Array([255, 127])); // 2-byte max
  // 3 bytes min
  t.assertEquals(Varuint.encode(16384), new Uint8Array([128, 128, 1]));
  // some more
  t.assertEquals(Varuint.encode(624485), new Uint8Array([0xe5, 0x8e, 0x26])); // classic LEB128 example
});

Deno.test("length basic boundaries", () => {
  t.assertEquals(Varuint.length(0), 1);
  t.assertEquals(Varuint.length(1), 1);
  t.assertEquals(Varuint.length(127), 1);

  t.assertEquals(Varuint.length(128), 2);
  t.assertEquals(Varuint.length(129), 2);
  t.assertEquals(Varuint.length(16383), 2);

  t.assertEquals(Varuint.length(16384), 3);
  t.assertEquals(Varuint.length(2097151), 3); // (1<<21)-1
  t.assertEquals(Varuint.length(2097152), 4); // 1<<21
});

Deno.test("encode uses length(n) exactly", () => {
  const values = [0, 1, 2, 3, 10, 127, 128, 255, 256, 16383, 16384, 65535, 65536, 1_000_000];
  for (const n of values) {
    const b = Varuint.encode(n);
    t.assertEquals(b.length, Varuint.length(n), `n=${n}`);
  }
});

Deno.test("decode number: known vectors", () => {
  t.assertEquals(Varuint.decode(new Uint8Array([0])), 0);
  t.assertEquals(Varuint.decode(new Uint8Array([1])), 1);
  t.assertEquals(Varuint.decode(new Uint8Array([127])), 127);

  t.assertEquals(Varuint.decode(new Uint8Array([128, 1])), 128);
  t.assertEquals(Varuint.decode(new Uint8Array([129, 1])), 129);

  t.assertEquals(Varuint.decode(new Uint8Array([255, 127])), 16383);
  t.assertEquals(Varuint.decode(new Uint8Array([128, 128, 1])), 16384);

  t.assertEquals(Varuint.decode(new Uint8Array([172, 2])), 300);
  t.assertEquals(Varuint.decode(new Uint8Array([0xe5, 0x8e, 0x26])), 624485);
});

Deno.test("decode supports offset", () => {
  const buf = new Uint8Array([9, 9, 172, 2, 9]);
  t.assertEquals(Varuint.decode(buf, 2), 300);
  t.assertEquals(Varuint.decode(buf, 0), 9);
});

Deno.test("roundtrip (numbers): small exhaustive 0..10000", () => {
  for (let n = 0; n <= 10_000; n++) {
    const enc = Varuint.encode(n);
    const dec = Varuint.decode(enc);
    t.assertEquals(dec, n, `n=${n}`);
  }
});

Deno.test("roundtrip (numbers): boundaries around 7-bit groups", () => {
  const candidates = [
    0, 1,
    126, 127, 128, 129,
    16_382, 16_383, 16_384, 16_385,
    2_097_150, 2_097_151, 2_097_152, 2_097_153,
    268_435_454, 268_435_455, 268_435_456, 268_435_457,
  ];
  for (const n of candidates) {
    const enc = Varuint.encode(n);
    const dec = Varuint.decode(enc);
    t.assertEquals(dec, n, `n=${n}`);
  }
});

Deno.test("bigint: encode/decode roundtrip", () => {
  const cases = [
    0n,
    1n,
    127n,
    128n,
    16383n,
    16384n,
    624485n,
    (1n << 32n) - 1n,
    1n << 32n,
    (1n << 63n) - 1n,
    1n << 63n,
    (1n << 100n) + 12345n,
  ];
  for (const n of cases) {
    const enc = Varuint.encode(n);
    const dec = Varuint.decode(enc, 0, true);
    t.assertEquals(dec, n, `n=${n.toString()}`);
    t.assertEquals(enc.length, Varuint.length(n), `len n=${n.toString()}`);
  }
});

Deno.test("decode number throws if value exceeds MAX_SAFE_INTEGER", () => {
  const over = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
  const enc = Varuint.encode(over);
  t.assertThrows(
    () => Varuint.decode(enc),
    RangeError,
    "MAX_SAFE_INTEGER",
  );
  // but BigInt mode should succeed
  t.assertEquals(Varuint.decode(enc, 0, true), over);
});

Deno.test("encode throws on negative", () => {
  t.assertThrows(() => Varuint.encode(-1), RangeError);
  t.assertThrows(() => Varuint.length(-1), RangeError);
  t.assertThrows(() => Varuint.encode(-1n), RangeError);
  t.assertThrows(() => Varuint.length(-1n), RangeError);
});

Deno.test("encode throws on unsafe number", () => {
  t.assertThrows(() => Varuint.encode(Number.MAX_SAFE_INTEGER + 1), RangeError);
  t.assertThrows(() => Varuint.length(Number.MAX_SAFE_INTEGER + 1), RangeError);

  // non-integer / NaN / Infinity are not safe integers
  t.assertThrows(() => Varuint.encode(1.1), RangeError);
  t.assertThrows(() => Varuint.length(1.1), RangeError);
  t.assertThrows(() => Varuint.encode(NaN), RangeError);
  t.assertThrows(() => Varuint.length(NaN), RangeError);
  t.assertThrows(() => Varuint.encode(Infinity), RangeError);
  t.assertThrows(() => Varuint.length(Infinity), RangeError);
});

Deno.test("decode throws on truncated input (continuation without terminator)", () => {
  // has continuation bit but no following byte
  t.assertThrows(() => Varuint.decode(new Uint8Array([0x80])), RangeError, "truncated");
  t.assertThrows(() => Varuint.decode(new Uint8Array([0x80, 0x80])), RangeError, "truncated");
});

Deno.test("decode ignores extra bytes after varint (offset usage)", () => {
  // decode reads only from offset; extra bytes at end should not matter
  const buf = new Uint8Array([0xAC, 0x02, 0xFF, 0xFF]);
  t.assertEquals(Varuint.decode(buf, 0), 300);
});

Deno.test("length matches expected for power-of-two boundaries (BigInt)", () => {
  // lo = 2^(7k) - 1 uses k bytes (except k=0 -> 1 byte)
  // hi = 2^(7k) uses k+1 bytes (including k=0 -> 1 byte)
  for (let k = 0n; k <= 20n; k++) {
    const lo = (1n << (7n * k)) - 1n;
    const hi = 1n << (7n * k);
    //console.log(lo, hi, Varuint.length(hi));

    const expectedLo = k === 0n ? 1 : Number(k);
    const expectedHi = Number(k + 1n);

    t.assertEquals(Varuint.length(lo), expectedLo, `k=${k} lo`);
    t.assertEquals(Varuint.length(hi), expectedHi, `k=${k} hi`);

    // next boundary: 2^(7(k+1)) must be (k+2) bytes
    const next = 1n << (7n * (k + 1n));
    t.assertEquals(Varuint.length(next), Number(k + 2n), `k=${k} next`);
  }
});
