import { describe, expect, it } from "@jest/globals";
import { createNumberCodec } from "../index";

describe("Standard Number Codec", () => {

  describe("Strategy 1: Default (No options)", () => {
    const codec = createNumberCodec();

    it("should handle 0 correctly", () => {
      const encoded = codec.encode(0);
      expect(encoded).toBe("\x00"); // Null character (index 0)
      expect(codec.decode(encoded)).toBe(0);
    });

    it("should encode and decode small numbers", () => {
      const num = 12345;
      const encoded = codec.encode(num);
      expect(codec.decode(encoded)).toBe(num);
    });

    it("should perfectly round-trip up to the MAX_SAFE_INTEGER", () => {
      // JS can only safely do exact integer math up to this point
      const hugeNumber = Number.MAX_SAFE_INTEGER; // 9007199254740991
      const encoded = codec.encode(hugeNumber);

      expect(typeof encoded).toBe("string");
      expect(codec.decode(encoded)).toBe(hugeNumber);
    });
  });

  describe("Strategy 2: Custom Characters Only", () => {
    // Standard Hexadecimal alphabet
    const hexChars = "0123456789abcdef";
    const codec = createNumberCodec({ characters: hexChars });

    it("should encode 0 to the first character of the alphabet", () => {
      const encoded = codec.encode(0);
      expect(encoded).toBe("0");
      expect(codec.decode(encoded)).toBe(0);
    });

    it("should encode numbers to exact base representations", () => {
      // 255 in hex is 'ff'
      expect(codec.encode(255)).toBe("ff");
      expect(codec.decode("ff")).toBe(255);
    });

    it("should round-trip safely within custom alphabets", () => {
      const largeNumber = 1000000000000;
      const encoded = codec.encode(largeNumber);

      // Verify it only uses characters from our alphabet
      const usesValidChars = encoded.split('').every(char => hexChars.includes(char));
      expect(usesValidChars).toBe(true);

      expect(codec.decode(encoded)).toBe(largeNumber);
    });
  });

  describe("Strategy 3: Word Length Only", () => {
    const wordLength = 4;
    const codec = createNumberCodec({ wordLength });

    it("should generate strings of the exact requested length", () => {
      const encoded = codec.encode(987654321);
      expect(encoded.length).toBe(wordLength);
    });

    it("should round-trip numbers perfectly within length constraints", () => {
      const num = 42;
      const encoded = codec.encode(num);
      expect(codec.decode(encoded)).toBe(num);
    });
  });

  describe("Strategy 4: Custom Characters AND Word Length", () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 style
    const wordLength = 5;
    const codec = createNumberCodec({ characters, wordLength });

    it("should generate strings of exact length using ONLY the allowed characters", () => {
      const encoded = codec.encode(8888);

      expect(encoded.length).toBe(wordLength);

      const usesValidChars = encoded.split('').every(char => characters.includes(char));
      expect(usesValidChars).toBe(true);
    });

    it("should completely round-trip back to the original number", () => {
      const num = 77777;
      const encoded = codec.encode(num);
      expect(codec.decode(encoded)).toBe(num);
    });
  });

  describe("Edge Cases and Safety", () => {
    it("should generate different outputs for different strategies", () => {
      const num = 1000;

      const defaultEncoded = createNumberCodec().encode(num);
      const hexEncoded = createNumberCodec({ characters: "0123456789abcdef" }).encode(num);

      expect(defaultEncoded).not.toBe(hexEncoded);

      // But both should decode back to 1000 in their respective codecs
      expect(createNumberCodec().decode(defaultEncoded)).toBe(num);
      expect(createNumberCodec({ characters: "0123456789abcdef" }).decode(hexEncoded)).toBe(num);
    });
  });
});