# int-codec

[![Standard JS][standard-js-src]][standard-js-href]
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

[standard-js-src]: https://img.shields.io/badge/license-MIT-brightgreen?&style=flat-square
[standard-js-href]: https://github.com/Generalsimus/int-codec/blob/main/LICENSE
[npm-version-src]: https://img.shields.io/npm/v/int-codec?&style=flat-square
[npm-version-href]: https://www.npmjs.com/package/int-codec
[npm-downloads-src]: https://img.shields.io/npm/dt/int-codec?&style=flat-square
[npm-downloads-href]: https://www.npmjs.com/package/int-codec

A highly optimized, bidirectional encoder/decoder for translating standard Numbers and massive BigInts into customizable strings.

Whether you need to hash database IDs into short YouTube-like strings, compress massive numbers into custom alphabets, or safely use emojis as mathematical bases, `int-codec` handles it with zero loss and maximum performance.

## Features

* **Two-Way Translation:** 100% mathematically reversible (`encode` and `decode`).
* **Emoji & Multi-byte Safe:** Native handling of complex Unicode characters and surrogate pairs. An emoji alphabet is treated as its visual character count, not its byte length.
* **Bijective Length Offsets:** Guaranteed minimum and maximum string lengths using offset-based padding (no fragile "0001" zero-padding).
* **BigInt & Standard Number Support:** Dedicated optimized factories for both.
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

### Strategy 1: Default (Maximum Compression)

Converts the number using the maximum safe 16-bit character range of standard JavaScript. Best for maximum string compression.

```typescript
const codec = createBigIntCodec();

```

### Strategy 2: Custom Characters (The Alphabet)

Provide a custom string of characters. The length of the string becomes your mathematical base. Great for Hexadecimal, Base32, making URL-safe IDs, or even Emojis.

```typescript
// Hexadecimal
const hexCodec = createBigIntCodec({ characters: "0123456789abcdef" });
hexCodec.encode(255n); // "ff"

// Emojis (Correctly handles surrogate pairs as Base 5)
const emojiCodec = createBigIntCodec({ characters: "🍎🍌🍇🍉🍓" });
emojiCodec.encode(4n); // "🍓"

```

### Strategy 3: "The Hidden Message" (Text -> Number -> Text)

Because the codec is 100% mathematically reversible, you can define an alphabet, **decode** a specific word to find its numeric value, and then **encode** that number back into the word!

```typescript 
import { createBigIntCodec } from "int-codec";

const textCodec = createBigIntCodec();
 
// 1. Decode a standard string to reveal its massive BigInt value
const secretNum = textCodec.decode("hello world!");
console.log(secretNum); // -> A BigInt Number

// 2. Encode the number back into the exact same string
const revealedMessage = textCodec.encode(secretNum);
console.log(revealedMessage); // -> "hello world!"

```

### Strategy 4: Length Boundaries (Offsets)

Ensures the output string is *always* at least a certain length. Instead of dumb zero-padding, `int-codec` uses a mathematical offset, shifting the entire range so that `0` starts at the first possible permutation of your minimum length.

```typescript
const boundedCodec = createBigIntCodec({ 
    characters: "0123456789", 
    minStringLength: 4,
    maxStringLength: 8 
});

boundedCodec.encode(0n); // "1000" (Offset safely guarantees length)

```

## Restrictions & Error Handling

To guarantee 100% data integrity, `int-codec` is strictly defensive and will throw descriptive errors if you cross mathematical boundaries:

* **No Negative Numbers:** The codec maps positive integers to string representations. Attempting to encode a negative number (e.g., `-5`) will throw an error.
* **Maximum Length Overflow:** If you define a `maxStringLength`, and you attempt to encode a number that requires more characters to represent in your chosen base, the codec will throw an error rather than returning an invalid string.
* **Invalid Decoding Characters:** If you attempt to `decode()` a string that contains a character not present in your defined `characters` alphabet, the library will immediately throw an error.
* **Number Precision Limit:** The `createNumberCodec` is strictly limited to `Number.MAX_SAFE_INTEGER` (`9,007,199,254,740,991`). If you need to encode numbers larger than this, you *must* use `createBigIntCodec` to avoid silent floating-point precision loss.

## API Reference

### `createNumberCodec(options?: CodecOptions): Codec<number>`

* Uses standard JavaScript double-precision floats.
* Safe up to `Number.MAX_SAFE_INTEGER`.

### `createBigIntCodec(options?: CodecOptions): Codec<bigint>`

* Uses JavaScript `BigInt` primitives.
* No mathematical upper limit.

### `CodecOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `characters` | `string` | Unicode Range | Optional. The custom alphabet to use for encoding. Handles multi-byte chars and emojis safely. |
| `minStringLength` | `number` | `0` | Optional. Guarantees the resulting string will be at least this many characters long. |
| `maxStringLength` | `number` | `Infinity` | Optional. Sets a hard cap on the string length. Throws an error if the number is too large to fit. |

## License

MIT
