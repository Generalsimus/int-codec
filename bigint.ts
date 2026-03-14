import { createBigintPermutations } from "./utils";

export interface BigIntCodecOptions {
    characters?: string;
    wordLength?: number;
}

export interface BigIntCodec {
    encode: (decodeBigint: bigint) => string;
    decode: (encodeString: string) => bigint;
}

// Extracted constant (0 to 65535 = 65536 possibilities)
const CHAR_BASE_JS = 65536n;

export const createBigIntCodec = (options?: BigIntCodecOptions): BigIntCodec => {
    if (!options) {
        return createCodecToString();
    }

    const { characters, wordLength } = options;

    if (typeof characters === "string" && typeof wordLength === "number") {
        return createCodecToWord({ characters, wordLength });
    }
    if (typeof characters === "string") {
        return createCodecToCharString({ characters });
    }
    if (typeof wordLength === "number") {
        return createCodecToMaxChars({ wordLength });
    }

    return createCodecToString();
};

const createCodecToString = (): BigIntCodec => ({
    encode: (decodeBigint) => {
        if (decodeBigint === 0n) return String.fromCharCode(0);

        let encodedString = "";
        let currentBigint = decodeBigint;

        while (currentBigint > 0n) {
            encodedString = String.fromCharCode(Number(currentBigint % CHAR_BASE_JS)) + encodedString;
            currentBigint /= CHAR_BASE_JS;
        }

        return encodedString;
    },
    decode: (encodeString) => {
        let decodedNumber = 0n;

        for (let i = 0; i < encodeString.length; i++) {
            decodedNumber = decodedNumber * CHAR_BASE_JS + BigInt(encodeString.charCodeAt(i));
        }

        return decodedNumber;
    },
});

const createCodecToCharString = ({
    characters,
}: Required<Omit<BigIntCodecOptions, "wordLength">>): BigIntCodec => {
    // OPTIMIZATION: Cache base outside the return closure
    const base = BigInt(characters.length);

    return {
        encode: (decodeNumber) => {
            if (decodeNumber === 0n) return characters[0];

            let encodedString = "";
            let currentNumber = decodeNumber;

            while (currentNumber > 0n) {
                const remainder = Number(currentNumber % base);
                encodedString = characters[remainder] + encodedString;
                currentNumber /= base;
            }

            return encodedString;
        },
        decode: (encodeString) => {
            let decodedNumber = 0n;

            for (let i = 0; i < encodeString.length; i++) {
                const index = BigInt(characters.indexOf(encodeString[i]));
                decodedNumber = decodedNumber * base + index;
            }

            return decodedNumber;
        },
    };
};

const createCodecToWord = ({
    characters,
    wordLength,
}: Required<BigIntCodecOptions>): BigIntCodec => {
    const charArray = characters.split("");
    const permutations = createBigintPermutations(BigInt(charArray.length), BigInt(wordLength));

    return {
        encode: (decodeNumber) => {
            const chars = [...charArray];
            let permutation = "";
            let currentNumber = decodeNumber;

            for (let i = 0; i < wordLength; i++) {
                const remainingPermutations = permutations[i];
                const characterIndex = Number(currentNumber / remainingPermutations);

                permutation += chars[characterIndex];
                chars.splice(characterIndex, 1);
                currentNumber %= remainingPermutations;
            }

            return permutation;
        },
        decode: (encodeString) => {
            const chars = [...charArray];
            let index = 0n;

            for (let i = 0; i < wordLength; i++) {
                const characterIndex = chars.indexOf(encodeString[i]);
                const remainingPermutations = permutations[i];

                index += BigInt(characterIndex) * remainingPermutations;
                chars.splice(characterIndex, 1);
            }

            return index;
        },
    };
};

const createCodecToMaxChars = ({
    wordLength,
}: Required<Omit<BigIntCodecOptions, "characters">>): BigIntCodec => {
    const permutations = createBigintPermutations(CHAR_BASE_JS, BigInt(wordLength));

    return {
        encode: (decodeNumber) => {
            let permutation = "";
            let currentNumber = decodeNumber;

            for (let i = 0; i < wordLength; i++) {
                const remainingPermutations = permutations[i];
                const characterIndex = Number(currentNumber / remainingPermutations);

                permutation += String.fromCharCode(characterIndex);
                currentNumber %= remainingPermutations;
            }

            return permutation;
        },
        decode: (encodeString) => {
            let index = 0n;

            for (let i = 0; i < wordLength; i++) {
                const characterIndex = BigInt(encodeString.charCodeAt(i));
                const remainingPermutations = permutations[i];

                index += characterIndex * remainingPermutations;
            }

            return index;
        },
    };
};