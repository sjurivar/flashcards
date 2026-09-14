export function primaryAnswer(aiAnswer: string, userAnswer: string | null | undefined): string {
  const own = (userAnswer ?? '').trim();
  return own !== '' ? own : aiAnswer;
}

export function hasOwnFormulation(userAnswer: string | null | undefined): boolean {
  return (userAnswer ?? '').trim() !== '';
}
