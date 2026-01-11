import { Varuint } from "./Varuint.js";

console.log(Varuint.length(0));        // 1
console.log(Varuint.length(127));      // 1
console.log(Varuint.length(128));      // 2

const b = Varuint.encode(300); // Uint8Array [0xAC, 0x02]
console.log(b);
console.log(Varuint.decode(b));             // 300
console.log(Varuint.decode(b, 0, true));    // 300n
