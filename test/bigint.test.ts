import { describe, expect, it } from "@jest/globals";
import { createBigIntCodec } from "../index";

describe("BigIntCodec (Default Unicode String)", () => {
    const codec = createBigIntCodec();

    it("should accurately encode and decode 0n", () => {
        const encoded = codec.encode(0n);
        expect(codec.decode(encoded)).toBe(0n);
    });

    it("should accurately encode and decode massive BigInts", () => {
        const massiveNumber = 999999999999999999999999999n;
        const encoded = codec.encode(massiveNumber);
        expect(codec.decode(encoded)).toBe(massiveNumber);
    });

    it("CRITICAL: should safely bypass the Unicode surrogate forbidden zone without crashing", () => {
        // 55296n is 0xD800, the exact start of the forbidden zone
        const dangerousNumber = 55296n;
        let encoded = "";
        expect(() => {
            encoded = codec.encode(dangerousNumber);
        }).not.toThrow();
        expect(codec.decode(encoded)).toBe(dangerousNumber);
    });

    it("should respect minWordLength and shift starting offset", () => {
        const minLengthCodec = createBigIntCodec({ minStringLength: 5 });
        const encodedZero = minLengthCodec.encode(0n);

        expect(encodedZero.length).toBe(5);
        expect(minLengthCodec.decode(encodedZero)).toBe(0n);
    });

    it("should throw on decode if string exceeds maxWordLength", () => {
        const maxCodec = createBigIntCodec({ maxStringLength: 3 });
        expect(() => maxCodec.decode("abcd")).toThrow(/cannot exceed 3 characters/);
    });
});

describe("BigIntCodec (Custom Characters)", () => {
    const customAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const customCodec = createBigIntCodec({ characters: customAlphabet });

    it("should encode and decode using custom characters", () => {
        const encoded = customCodec.encode(1337n);

        for (const char of encoded) {
            expect(customAlphabet.includes(char)).toBe(true);
        }
        expect(customCodec.decode(encoded)).toBe(1337n);
    });

    it("should handle 0n correctly using the first character in the array", () => {
        const encoded = customCodec.encode(0n);
        expect(encoded).toBe("A"); // A is index 0
        expect(customCodec.decode(encoded)).toBe(0n);
    });

    it("should throw an error when decoding invalid characters", () => {
        expect(() => customCodec.decode("AABa")).toThrow(/Invalid character/);
    });

    it("should safely encode and decode using Emojis (Multi-byte strings)", () => {
        const emojiCodec = createBigIntCodec({ characters: "🍎🍌🍇🍉🍓" });
        const encoded = emojiCodec.encode(42n);
        expect(emojiCodec.decode(encoded)).toBe(42n);
    });

    it("should respect minWordLength with custom characters", () => {
        const minLengthCodec = createBigIntCodec({ characters: "01", minStringLength: 8 });
        const encodedZero = minLengthCodec.encode(0n);

        expect(encodedZero.length).toBe(8);
        expect(minLengthCodec.decode(encodedZero)).toBe(0n);
    });
});