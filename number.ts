import { createNumberPermutations } from "./utils";

export interface NumberCodecOptions {
    characters?: string;
    wordLength?: number;
}

export interface NumberCodec {
    encode: (decodeNumber: number) => string;
    decode: (encodeString: string) => number;
}

// Extracted constant (0 to 65535 = 65536 possibilities)
const CHAR_BASE_JS = 65536;

export const createNumberCodec = (options?: NumberCodecOptions): NumberCodec => {
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

const createCodecToString = (): NumberCodec => ({
    encode: (decodeNumber) => {
        if (decodeNumber === 0) return String.fromCharCode(0);

        let encodedString = "";
        let currentNumber = decodeNumber;

        while (currentNumber > 0) {
            encodedString = String.fromCharCode(currentNumber % CHAR_BASE_JS) + encodedString;
            currentNumber = Math.floor(currentNumber / CHAR_BASE_JS);
        }

        return encodedString;
    },
    decode: (encodeString) => {
        let decodedNumber = 0;

        // OPTIMIZATION: Horner's method
        for (let i = 0; i < encodeString.length; i++) {
            decodedNumber = decodedNumber * CHAR_BASE_JS + encodeString.charCodeAt(i);
        }

        return decodedNumber;
    },
});

const createCodecToCharString = ({
    characters,
}: Required<Omit<NumberCodecOptions, "wordLength">>): NumberCodec => {
    const base = characters.length; 

    return {
        encode: (decodeNumber) => {
            if (decodeNumber === 0) return characters[0];

            let encodedString = "";
            let currentNumber = decodeNumber;

            while (currentNumber > 0) {
                encodedString = characters[currentNumber % base] + encodedString;
                currentNumber = Math.floor(currentNumber / base);
            }

            return encodedString;
        },
        decode: (encodeString) => {
            let decodedNumber = 0;

            // OPTIMIZATION: Horner's method
            for (let i = 0; i < encodeString.length; i++) {
                const index = characters.indexOf(encodeString[i]);
                decodedNumber = decodedNumber * base + index;
            }

            return decodedNumber;
        },
    };
};

const createCodecToWord = ({
    characters,
    wordLength,
}: Required<NumberCodecOptions>): NumberCodec => {
    const charArray = characters.split("");
    const permutations = createNumberPermutations(charArray.length, wordLength);

    return {
        encode: (decodeNumber) => {
            const chars = [...charArray];
            let permutation = "";
            let currentNumber = decodeNumber;

            for (let i = 0; i < wordLength; i++) {
                const remainingPermutations = permutations[i];
                const characterIndex = Math.floor(currentNumber / remainingPermutations);

                permutation += chars[characterIndex];
                chars.splice(characterIndex, 1);
                currentNumber %= remainingPermutations;
            }

            return permutation;
        },
        decode: (encodeString) => {
            const chars = [...charArray];
            let index = 0;

            for (let i = 0; i < wordLength; i++) {
                const characterIndex = chars.indexOf(encodeString[i]);
                const remainingPermutations = permutations[i];

                index += characterIndex * remainingPermutations;
                chars.splice(characterIndex, 1);
            }

            return index;
        },
    };
};

const createCodecToMaxChars = ({
    wordLength,
}: Required<Omit<NumberCodecOptions, "characters">>): NumberCodec => {
    const permutations = createNumberPermutations(CHAR_BASE_JS, wordLength);

    return {
        encode: (decodeNumber) => {
            let permutation = "";
            let currentNumber = decodeNumber;

            for (let i = 0; i < wordLength; i++) {
                const remainingPermutations = permutations[i];
                const characterIndex = Math.floor(currentNumber / remainingPermutations);

                permutation += String.fromCharCode(characterIndex);
                currentNumber %= remainingPermutations;
            }

            return permutation;
        },
        decode: (encodeString) => {
            let index = 0;

            for (let i = 0; i < wordLength; i++) {
                const characterIndex = encodeString.charCodeAt(i);
                const remainingPermutations = permutations[i];

                index += characterIndex * remainingPermutations;
            }

            return index;
        },
    };
};