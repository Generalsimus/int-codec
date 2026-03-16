import { Codec, CodecOptions } from "./index";


export type BigIntCodec = Codec<bigint>

const MAX_UNICODE_CODE = 0x10FFFF;

const UNICODE_BASE_JS = BigInt(MAX_UNICODE_CODE + 1);

export const createBigIntCodec = (options?: CodecOptions): BigIntCodec => {
    if (!options) {
        return createCodecToString({});
    }

    const { characters, minStringLength, maxStringLength } = options;

    if (typeof characters === "string") {
        return createCodecToCharString({ characters, minStringLength, maxStringLength });
    }

    return createCodecToString(options);
};

const createCodecToString = ({
    minStringLength = 0,
    maxStringLength = Infinity
}: Pick<CodecOptions, "minStringLength" | "maxStringLength">): BigIntCodec => {

    const startingOffset = minStringLength > 1 ? UNICODE_BASE_JS ** BigInt(minStringLength - 1) : 0n;

    const maxAllowedInput = maxStringLength !== Infinity ? (UNICODE_BASE_JS ** BigInt(maxStringLength)) - startingOffset : null;

    return {
        encode: (decodeBigint) => {
            if (decodeBigint < 0n) {
                throw new Error("Encode Error: Number cannot be negative.");
            }
            if (maxAllowedInput !== null && decodeBigint >= maxAllowedInput) {
                throw new Error("Number exceeds max length.");
            }

            let currentBigint = decodeBigint + startingOffset;

            let encodedString = "";

            while (currentBigint > 0n) {
                const remainder = Number(currentBigint % UNICODE_BASE_JS);

                encodedString = String.fromCodePoint(remainder) + encodedString;
                currentBigint /= UNICODE_BASE_JS;
            }

            return encodedString;
        },
        decode: (encodeString) => {
            const encodeStringArray = [...encodeString]
            if (encodeStringArray.length < minStringLength) {
                throw new Error(`Decode Error: String must be at least ${minStringLength} characters.`);
            }
            if (encodeStringArray.length > maxStringLength) {
                throw new Error(`Decode Error: String cannot exceed ${maxStringLength} characters.`);
            }
            let decodedNumber = 0n;


            for (const char of encodeStringArray) {
                const charCode = BigInt(char.codePointAt(0)!);
                decodedNumber = decodedNumber * UNICODE_BASE_JS + charCode;
            }

            return decodedNumber - startingOffset;
        },
    };


}

const createCodecToCharString = ({
    characters,
    minStringLength = 0,
    maxStringLength = Infinity
}: (Omit<CodecOptions, "characters"> & Required<Pick<CodecOptions, "characters">>)): BigIntCodec => {
    const charactersArray = [...characters]
    const base = BigInt(charactersArray.length);

    const startingOffset = minStringLength > 1 ? base ** BigInt(minStringLength - 1) : 0n;

    const maxAllowedInput = maxStringLength !== Infinity ? (base ** BigInt(maxStringLength)) - startingOffset : null;
    return {
        encode: (decodeBigint) => {
            if (decodeBigint < 0n) {
                throw new Error("Encode Error: Number cannot be negative.");
            }
            if (maxAllowedInput !== null && decodeBigint >= maxAllowedInput) {
                throw new Error("Number exceeds max length.");
            }

            let currentBigint = decodeBigint + startingOffset;
            let encodedString = "";

            do {
                // Change UNICODE_BASE_JS back to base!
                const remainder = Number(currentBigint % base);
                encodedString = charactersArray[remainder] + encodedString;
                currentBigint /= base;
            } while (currentBigint > 0n);

            return encodedString;
        },
        decode: (encodeString) => {
            const encodeStringArray = [...encodeString]
            if (encodeStringArray.length < minStringLength) {
                throw new Error(`Decode Error: String must be at least ${minStringLength} characters.`);
            }
            if (encodeStringArray.length > maxStringLength) {
                throw new Error(`Decode Error: String cannot exceed ${maxStringLength} characters.`);
            }

            let decodedNumber = 0n;

            for (let i = 0; i < encodeStringArray.length; i++) {
                const charIndex = charactersArray.indexOf(encodeStringArray[i]);

                if (charIndex === -1) {
                    throw new Error(`Decode Error: Invalid character '${encodeStringArray[i]}'`);
                }
                decodedNumber = decodedNumber * base + BigInt(charIndex);
            }


            return decodedNumber - startingOffset;
        },
    };
};