/** Public tool destinations shared by navigation and contextual recommendations. */
export const toolDirectory = [
  { href: '/finger-chooser/', name: 'Finger chooser', use: 'Touch the screen to choose a starter or a full turn order.', label: 'AT THE TABLE' },
  { href: '/coin-flip/', name: 'Coin flip', use: 'Make a fair heads-or-tails decision between two choices.', label: 'TWO CHOICES' },
  { href: '/random-team-generator/', name: 'Random team generator', use: 'Split up to 200 names into 2–10 evenly sized teams.', label: 'MAKE TEAMS' },
  { href: '/rock-paper-scissors/', name: 'Rock paper scissors', use: 'Choose in secret, then reveal both players’ throws together.', label: 'TWO PLAYERS' },
  { href: '/dice-roller/', name: 'Dice roller', use: 'Roll up to 12 dice, from d4 to d100, and see the total.', label: 'LOST THE DICE' },
  { href: '/turn-order-generator/', name: 'Turn order generator', use: 'Shuffle every player into a fair random playing order.', label: 'FULL ORDER' },
  { href: '/score-keeper/', name: 'Score keeper', use: 'Track points for every player, saved on your phone.', label: 'KEEP SCORE' },
  { href: '/turn-timer/', name: 'Turn timer', use: 'Count down each turn from 30 seconds to 3 minutes.', label: 'KEEP IT MOVING' },
  { href: '/random-letter-generator/', name: 'Random letter generator', use: 'Draw a letter for Scattergories and word games, skipping hard letters.', label: 'WORD GAMES' },
  { href: '/card-draw/', name: 'Draw a card', use: 'Draw from a shuffled 52-card deck, for high-card draws and more.', label: 'CARD GAMES' },
  { href: '/random-number-generator/', name: 'Random number generator', use: 'Get a fair whole number in any range you choose.', label: 'ANY RANGE' },
] as const;

type ToolPath = typeof toolDirectory[number]['href'];
const recommendations: Record<ToolPath, readonly ToolPath[]> = {
  '/finger-chooser/': ['/turn-order-generator/', '/coin-flip/', '/random-team-generator/'],
  '/coin-flip/': ['/rock-paper-scissors/', '/finger-chooser/', '/dice-roller/'],
  '/random-team-generator/': ['/turn-order-generator/', '/score-keeper/', '/turn-timer/'],
  '/rock-paper-scissors/': ['/coin-flip/', '/finger-chooser/', '/random-team-generator/'],
  '/dice-roller/': ['/score-keeper/', '/card-draw/', '/random-number-generator/'],
  '/turn-order-generator/': ['/random-team-generator/', '/score-keeper/', '/turn-timer/'],
  '/score-keeper/': ['/turn-timer/', '/dice-roller/', '/turn-order-generator/'],
  '/turn-timer/': ['/random-letter-generator/', '/score-keeper/', '/random-team-generator/'],
  '/random-letter-generator/': ['/turn-timer/', '/score-keeper/', '/random-team-generator/'],
  '/card-draw/': ['/score-keeper/', '/coin-flip/', '/turn-order-generator/'],
  '/random-number-generator/': ['/dice-roller/', '/coin-flip/', '/turn-order-generator/'],
};

export function relatedTools(current: string) {
  const paths = recommendations[current as ToolPath] ?? ['/dice-roller/', '/score-keeper/', '/turn-timer/'];
  return paths.filter(path => path !== current).flatMap(path => {
    const tool = toolDirectory.find(candidate => candidate.href === path);
    return tool ? [tool] : [];
  });
}
