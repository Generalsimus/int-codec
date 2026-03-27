
export interface CodecOptions {
    characters?: string;

    minStringLength?: number | undefined;
    maxStringLength?: number | undefined;
}
export interface Codec<E extends number | bigint> {
    encode: (decodeNumber: E) => string;
    decode: (encodeString: string) => E;
}

export * from "./number"
export * from "./bigint"