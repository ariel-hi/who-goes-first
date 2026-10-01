// Share-card text for standalone tool pages, keyed by the page path segment.
export const toolCards: Record<string, { heading: string; body: string }> = {
  'finger-chooser': { heading: 'Finger chooser', body: 'Everyone puts a finger on the phone. A spotlight closes in and picks who goes first.' },
  'coin-flip': { heading: 'Flip a coin', body: 'A fair heads-or-tails flip for two players or two teams, with a running tally.' },
  'random-team-generator': { heading: 'Random teams', body: 'Type the names, pick how many teams, and get fair, evenly sized teams in one tap.' },
  'rock-paper-scissors': { heading: 'Rock paper scissors', body: 'Choose in secret, then reveal both throws together to settle who goes first.' },
  'dice-roller': { heading: 'Roll dice online', body: 'Up to 12 dice, from d4 to d100, with the total added up. For when the dice go missing.' },
  'random-number-generator': { heading: 'Random number generator', body: 'A fair whole number from 1 to 10, 1 to 100 or any range you choose.' },
  'turn-order-generator': { heading: 'Turn order generator', body: 'Shuffle every player’s name into a fair random playing order.' },
  'score-keeper': { heading: 'Score keeper', body: 'Track everyone’s points on your phone. Tap to score and see who is winning.' },
  'turn-timer': { heading: 'Turn timer', body: 'A countdown from 30 seconds to 3 minutes that keeps every turn moving.' },
  'random-letter-generator': { heading: 'Random letter generator', body: 'Draw a letter for Scattergories and word games, skipping the hard ones.' },
  'card-draw': { heading: 'Draw a card', body: 'Draw from a freshly shuffled 52-card deck, for high-card draws and more.' },
};
