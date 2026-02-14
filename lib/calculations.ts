export function calculateWaste(rawInput: number, output: number) {
  return rawInput - output;
}

export function calculateYield(rawInput: number, output: number) {
  if (rawInput === 0) return 0;
  return (output / rawInput) * 100;
}
