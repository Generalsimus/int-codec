
export interface CodecOptions {
    characters?: string;

    minStringLength?: number;
    maxStringLength?: number;
}
export interface Codec<E extends number | bigint> {
    encode: (decodeNumber: E) => string;
    decode: (encodeString: string) => E;
}

export * from "./number"
export * from "./bigint"