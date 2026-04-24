export function normalizeWord(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’]/g, "");
}

export function isCorrectWord(input: string, expected: string) {
  return normalizeWord(input) === normalizeWord(expected);
}