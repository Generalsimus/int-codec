const factorial = (n: bigint): bigint => {
    let result = 1n;
    for (let i = 1n; i <= n; i++) {
        result *= i;
    }
    return result;
};

const permutationsBigint = (n: bigint, r: bigint) =>
    factorial(n) / factorial(n - r);


export const createBigintPermutations = (size: bigint, momentumSize: bigint) => {
    const permutations: bigint[] = [];
    for (let i = 0n; i < momentumSize; i++) {
        permutations.push(permutationsBigint(size - i - 1n, momentumSize - i - 1n))
    }
    return permutations
}

export const createNumberPermutations = (size: number, momentumSize: number) => {
    return createBigintPermutations(BigInt(size), BigInt(momentumSize)).map(Number)
}