import { useState } from 'react';
import { shuffle } from '../../lib/tools';

const SUITS = [{ s: '♠', name: 'spades', red: false }, { s: '♥', name: 'hearts', red: true }, { s: '♦', name: 'diamonds', red: true }, { s: '♣', name: 'clubs', red: false }];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
type Card = { rank: string; suit: (typeof SUITS)[number] };
const freshDeck = (): Card[] => shuffle(SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit }))));

export default function CardDraw() {
  const [deck, setDeck] = useState<Card[]>(freshDeck);
  const [drawn, setDrawn] = useState<Card[]>([]);
  const draw = () => { if (!deck.length) return; setDrawn(list => [deck[0]!, ...list]); setDeck(d => d.slice(1)); };
  const reset = () => { setDeck(freshDeck()); setDrawn([]); };
  const top = drawn[0];
  return (
    <div className="card-tool">
      <div className={`tool-card${top?.suit.red ? ' tool-card-red' : ''}${top ? '' : ' tool-card-back'}`} key={drawn.length} aria-hidden="true">
        {top ? <><span>{top.rank}</span><span className="tool-card-suit">{top.suit.s}</span></> : <span>?</span>}
      </div>
      <p className="tool-result" role="status" aria-live="polite">{top ? `${top.rank === 'A' ? 'Ace' : top.rank === 'J' ? 'Jack' : top.rank === 'Q' ? 'Queen' : top.rank === 'K' ? 'King' : top.rank} of ${top.suit.name}` : 'Shuffled 52-card deck'}</p>
      <button type="button" className="primary" onClick={draw} disabled={!deck.length}>{deck.length ? 'Draw a card' : 'Deck is empty'}</button>
      <p className="small muted tool-tally">{deck.length} cards left. <button type="button" className="text-button" onClick={reset}>Shuffle a new deck</button></p>
      {drawn.length > 1 && <p className="small muted">Drawn: {drawn.slice(1, 13).map(c => `${c.rank}${c.suit.s}`).join(' ')}</p>}
    </div>
  );
}
