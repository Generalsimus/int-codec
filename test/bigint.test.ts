import { describe, expect, it } from "@jest/globals";
import { createBigIntCodec } from "../index"; // Adjust path if necessary

describe("BigInt Codec", () => {
    
    describe("Strategy 1: Default (No options)", () => {
        const codec = createBigIntCodec();

        it("should handle 0n correctly", () => {
            const encoded = codec.encode(0n);
            expect(encoded).toBe("\x00"); // Null character (index 0)
            expect(codec.decode(encoded)).toBe(0n);
        });

        it("should encode and decode small numbers", () => {
            const num = 12345n;
            const encoded = codec.encode(num);
            expect(codec.decode(encoded)).toBe(num);
        });

        it("should perfectly round-trip massive BigInts", () => {
            // A ridiculously large number
            const hugeNumber = 987654321012345678909876543210n;
            const encoded = codec.encode(hugeNumber);
            
            expect(typeof encoded).toBe("string");
            expect(codec.decode(encoded)).toBe(hugeNumber);
        });
    });

    describe("Strategy 2: Custom Characters Only", () => {
        // Standard Hexadecimal alphabet
        const hexChars = "0123456789abcdef";
        const codec = createBigIntCodec({ characters: hexChars });

        it("should encode 0n to the first character of the alphabet", () => {
            const encoded = codec.encode(0n);
            expect(encoded).toBe("0");
            expect(codec.decode(encoded)).toBe(0n);
        });

        it("should encode numbers to exact base representations", () => {
            // 255 in hex is 'ff'
            expect(codec.encode(255n)).toBe("ff");
            expect(codec.decode("ff")).toBe(255n);
        });

        it("should round-trip large numbers with custom characters", () => {
            const largeNumber = 1000000000000000n;
            const encoded = codec.encode(largeNumber);
            
            // Verify it only uses characters from our alphabet
            const usesValidChars = encoded.split('').every(char => hexChars.includes(char));
            expect(usesValidChars).toBe(true);
            
            expect(codec.decode(encoded)).toBe(largeNumber);
        });
    });

    describe("Strategy 3: Word Length Only", () => {
        const wordLength = 5;
        const codec = createBigIntCodec({ wordLength });

        it("should generate strings of the exact requested length", () => {
            const encoded = codec.encode(123456789n);
            expect(encoded.length).toBe(wordLength);
        });

        it("should round-trip numbers perfectly within length constraints", () => {
            const num = 42n;
            const encoded = codec.encode(num);
            expect(codec.decode(encoded)).toBe(num);
        });
    });

    describe("Strategy 4: Custom Characters AND Word Length", () => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 style
        const wordLength = 6;
        const codec = createBigIntCodec({ characters, wordLength });

        it("should generate strings of exact length using ONLY the allowed characters", () => {
            const encoded = codec.encode(9999n);
            
            expect(encoded.length).toBe(wordLength);
            
            const usesValidChars = encoded.split('').every(char => characters.includes(char));
            expect(usesValidChars).toBe(true);
        });

        it("should completely round-trip back to the original number", () => {
            const num = 55555n;
            const encoded = codec.encode(num);
            expect(codec.decode(encoded)).toBe(num);
        });
    });

    describe("Edge Cases and Consistency", () => {
        it("should generate different outputs for different strategies", () => {
            const num = 1000n;
            
            const defaultEncoded = createBigIntCodec().encode(num);
            const hexEncoded = createBigIntCodec({ characters: "0123456789abcdef" }).encode(num);
            
            expect(defaultEncoded).not.toBe(hexEncoded);
            
            // But both should decode back to 1000n in their respective codecs
            expect(createBigIntCodec().decode(defaultEncoded)).toBe(num);
            expect(createBigIntCodec({ characters: "0123456789abcdef" }).decode(hexEncoded)).toBe(num);
        });
    });
});