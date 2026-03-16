import { describe, expect, it } from "@jest/globals";
import { createNumberCodec } from "../index";

describe("NumberCodec", () => {
  const codec = createNumberCodec();

  it("should accurately encode and decode 0", () => {
    const encoded = codec.encode(0);
    expect(codec.decode(encoded)).toBe(0);
  });

  it("should accurately encode and decode standard positive numbers", () => {
    const encoded = codec.encode(123456);
    expect(codec.decode(encoded)).toBe(123456);
  });

  it("should accurately encode and decode Number.MAX_SAFE_INTEGER", () => {
    const maxSafe = Number.MAX_SAFE_INTEGER;
    const encoded = codec.encode(maxSafe);
    expect(codec.decode(encoded)).toBe(maxSafe);
  });

  it("should throw an error if trying to encode a float/decimal", () => {
    expect(() => codec.encode(12.34)).toThrow(/only supports integers/);
  });

  it("should throw an error if encoding a number larger than MAX_SAFE_INTEGER", () => {
    // We use + 2 because standard JS math rounds MAX_SAFE_INTEGER + 1 down
    expect(() => codec.encode(Number.MAX_SAFE_INTEGER + 2)).toThrow(/exceeds Number.MAX_SAFE_INTEGER/);
  });

  it("should throw an error on negative numbers", () => {
    expect(() => codec.encode(-5)).toThrow(/cannot be negative/);
  });
});