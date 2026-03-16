import { Codec, CodecOptions } from "./index";
import { createBigIntCodec } from "./bigint";



export type NumberCodec = Codec<number>


const JS_MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

export const createNumberCodec = (options?: CodecOptions): NumberCodec => {

    const codec = createBigIntCodec(options)
    return {
        encode: (decodeNumber) => {
            if (!Number.isInteger(decodeNumber)) {
                throw new Error(`Encode Error: NumberCodec only supports integers. Received: ${decodeNumber}`);
            }
            if (decodeNumber > Number.MAX_SAFE_INTEGER) {
                throw new Error(`Encode Error: Value exceeds Number.MAX_SAFE_INTEGER. Please use createBigIntCodec for this value.`);
            }
            return codec.encode(BigInt(decodeNumber))
        },
        decode: (encodeString) => {
            const decodedBigInt = codec.decode(encodeString);
            if (decodedBigInt > JS_MAX_SAFE_INTEGER) {
                throw new Error(`Decode Error: Decoded value exceeds standard number limits. Please use BigIntCodec to decode this string.`);
            }
            return Number(decodedBigInt)
        }
    }
};
