import { useState } from 'react';
import { rpsWinner, throws, type Throw } from '../../lib/tools';

const icons: Record<Throw, string> = { rock: '✊', paper: '✋', scissors: '✌️' };
const names: Record<Throw, string> = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
type Step = 'p1' | 'pass' | 'p2' | 'reveal';

// Pass-and-play on one phone: each choice stays hidden until both are in.
export default function RockPaperScissors() {
  const [step, setStep] = useState<Step>('p1');
  const [first, setFirst] = useState<Throw | null>(null);
  const [second, setSecond] = useState<Throw | null>(null);
  const [score, setScore] = useState([0, 0]);
  const choose = (choice: Throw) => {
    if (step === 'p1') { setFirst(choice); setStep('pass'); return; }
    setSecond(choice); setStep('reveal');
    const winner = rpsWinner(first!, choice);
    if (winner) setScore(s => s.map((v, i) => (i === winner - 1 ? v + 1 : v)));
  };
  const again = () => { setFirst(null); setSecond(null); setStep('p1'); };
  const winner = step === 'reveal' ? rpsWinner(first!, second!) : null;
  return (
    <div className="rps-tool">
      <p className="small muted rps-score" aria-label={`Score: Player 1 ${score[0]}, Player 2 ${score[1]}`}>Player 1 <b>{score[0]}</b> · <b>{score[1]}</b> Player 2</p>
      {(step === 'p1' || step === 'p2') && <>
        <h2 className="rps-turn">{step === 'p1' ? 'Player 1, choose in secret' : 'Player 2, choose in secret'}</h2>
        <div className="rps-choices">{throws.map(choice => <button key={choice} type="button" onClick={() => choose(choice)}><span aria-hidden="true">{icons[choice]}</span>{names[choice]}</button>)}</div>
      </>}
      {step === 'pass' && <>
        <h2 className="rps-turn">Locked in. Pass the phone to Player 2.</h2>
        <button type="button" className="primary" onClick={() => setStep('p2')}>I’m Player 2</button>
      </>}
      {step === 'reveal' && <div role="status" aria-live="polite">
        <div className="rps-reveal"><span><small>Player 1</small><b aria-hidden="true">{icons[first!]}</b>{names[first!]}</span><span><small>Player 2</small><b aria-hidden="true">{icons[second!]}</b>{names[second!]}</span></div>
        <p className="tool-result">{winner === 0 ? 'Tie! Throw again.' : `Player ${winner} wins and goes first.`}</p>
        <button type="button" className="primary" onClick={again}>{winner === 0 ? 'Throw again' : 'Play again'}</button>
      </div>}
    </div>
  );
}
