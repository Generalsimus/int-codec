# int-codec

[![Standard JS][standard-js-src]][standard-js-href]
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

<!-- Refs -->
[standard-js-src]: https://img.shields.io/badge/license-MIT-brightgreen?&style=flat-square
[standard-js-href]: https://github.com/Generalsimus/int-mask/blob/main/LICENSE

[npm-version-src]: https://img.shields.io/npm/v/int-mask?&style=flat-square
[npm-version-href]: https://www.npmjs.com/package/int-mask

[npm-downloads-src]: https://img.shields.io/npm/dt/int-mask?&style=flat-square
[npm-downloads-href]: https://www.npmjs.com/package/int-mask

[bundle-phobia-src]: https://img.shields.io/bundlephobia/min/int-mask?&style=flat-square&color=red
[bundle-phobia-href]: https://packagephobia.com/result?p=int-mask


A highly optimized, bidirectional encoder/decoder for translating standard Numbers and massive BigInts into customizable strings.

Whether you need to hash database IDs into short YouTube-like strings, compress massive numbers into custom alphabets, or generate fixed-length permutations, `int-codec` handles it with zero loss and maximum performance.

## Features

* **Two-Way Translation:** 100% mathematically reversible (`encode` and `decode`).
* **BigInt & Standard Number Support:** Dedicated optimized factories for both.
* **4 Encoding Strategies:** Choose from default bases, custom alphabets, fixed-length words, or a combination.
* **High Performance:** Uses Horner's method for O(n) decoding time, completely avoiding expensive exponentiation math.
* **Zero Dependencies:** Extremely lightweight.

## Installation

```bash
npm install int-codec

```

*Or using yarn/pnpm:*

```bash
yarn add int-codec
pnpm add int-codec

```

## Quick Start

### 1. Standard Numbers (Up to MAX_SAFE_INTEGER)

```typescript
import { createNumberCodec } from "int-codec";

const codec = createNumberCodec();

const encoded = codec.encode(123456789); 
// -> Returns a highly compressed string

const decoded = codec.decode(encoded); 
// -> 123456789

```

### 2. Massive BigInts (No upper limit)

```typescript
import { createBigIntCodec } from "int-codec";

const codec = createBigIntCodec();

const massiveNumber = 987654321012345678909876543210n;
const encoded = codec.encode(massiveNumber);

const decoded = codec.decode(encoded); 
// -> 987654321012345678909876543210n

```

## Encoding Strategies & Options

Both `createNumberCodec` and `createBigIntCodec` accept an optional configuration object to change how the encoding behaves.

### Strategy 1: Default (No options)

Converts the number using the maximum safe 16-bit character range of standard JavaScript (Base 65536). Best for maximum string compression.

```typescript
const codec = createNumberCodec();

```

### Strategy 2: Custom Characters (Alphabet)

Provide a custom string of characters. The length of the string becomes your mathematical base. Great for Hexadecimal, Base32, or making URL-safe IDs.

```typescript
const hexCodec = createNumberCodec({ 
    characters: "0123456789abcdef" 
});

hexCodec.encode(255); // "ff"

```

### Strategy 3: Fixed Word Length

Ensures the output string is *always* exactly the length you specify, distributing the number across a mathematical permutation of the default JS character set.

```typescript
const lengthCodec = createNumberCodec({ 
    wordLength: 8 
});

lengthCodec.encode(42).length; // Always 8

```

### Strategy 4: Custom Characters + Fixed Word Length

The ultimate control. Combines a custom alphabet with a strict output length limit.

```typescript
const customIdCodec = createNumberCodec({ 
    characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", // Base32
    wordLength: 6 
});

const myId = customIdCodec.encode(9999); 
// Returns a 6-character string using ONLY the provided characters.

```

## API Reference

### `createNumberCodec(options?: CodecOptions): NumberCodec`

* Uses standard JavaScript double-precision floats.
* Safe up to `Number.MAX_SAFE_INTEGER` (`9,007,199,254,740,991`).

### `createBigIntCodec(options?: CodecOptions): BigIntCodec`

* Uses JavaScript `BigInt` primitives (`123n`).
* No mathematical upper limit.

### `CodecOptions`

| Property | Type | Description |
| --- | --- | --- |
| `characters` | `string` | Optional. The custom alphabet to use for encoding. |
| `wordLength` | `number` | Optional. The exact fixed length of the resulting encoded string. |

## License

MIT
