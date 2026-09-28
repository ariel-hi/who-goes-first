import { useEffect, useRef, useState, type MouseEvent } from 'react';
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
  const tool = useRef<HTMLDivElement>(null);
  const focusNext = useRef(false);
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    // Continue from the removed control without taking focus from another element.
    if (document.activeElement === document.body) tool.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, [step]);
  const advance = (event: MouseEvent<HTMLButtonElement>, next: Step) => {
    focusNext.current = document.activeElement === event.currentTarget;
    setStep(next);
  };
  const choose = (choice: Throw, event: MouseEvent<HTMLButtonElement>) => {
    if (step === 'p1') { setFirst(choice); advance(event, 'pass'); return; }
    setSecond(choice); advance(event, 'reveal');
    const winner = rpsWinner(first!, choice);
    if (winner) setScore(s => s.map((v, i) => (i === winner - 1 ? v + 1 : v)));
  };
  const again = (event: MouseEvent<HTMLButtonElement>) => { setFirst(null); setSecond(null); advance(event, 'p1'); };
  const winner = step === 'reveal' ? rpsWinner(first!, second!) : null;
  return (
    <div ref={tool} className="rps-tool">
      <p className="small muted rps-score" aria-label={`Score: Player 1 ${score[0]}, Player 2 ${score[1]}`}>Player 1 <b>{score[0]}</b> · <b>{score[1]}</b> Player 2</p>
      {(step === 'p1' || step === 'p2') && <>
        <h2 className="rps-turn">{step === 'p1' ? 'Player 1, choose in secret' : 'Player 2, choose in secret'}</h2>
        <div className="rps-choices">{throws.map(choice => <button className={`rps-choice rps-${choice}`} key={choice} type="button" onClick={event => choose(choice, event)}><span className="rps-choice-token" aria-hidden="true">{icons[choice]}</span><strong>{names[choice]}</strong></button>)}</div>
      </>}
      {step === 'pass' && <>
        <h2 className="rps-turn">Locked in. Pass the phone to Player 2.</h2>
        <button type="button" className="primary" onClick={event => advance(event, 'p2')}>I’m Player 2</button>
      </>}
      {step === 'reveal' && <div role="status" aria-live="polite">
        <div className="rps-arena" data-winner={winner}>
          <div className={`rps-contender rps-${first!}${winner === 1 ? ' rps-victor' : ''}`}><small>Player 1</small><span className="rps-choice-token" aria-hidden="true">{icons[first!]}</span><strong>{names[first!]}</strong></div>
          <span className="rps-versus" aria-hidden="true">VS</span>
          <div className={`rps-contender rps-${second!}${winner === 2 ? ' rps-victor' : ''}`}><small>Player 2</small><span className="rps-choice-token" aria-hidden="true">{icons[second!]}</span><strong>{names[second!]}</strong></div>
        </div>
        <p className="tool-result">{winner === 0 ? 'Tie! Throw again.' : `Player ${winner} wins and goes first.`}</p>
        <button type="button" className="primary" onClick={again}>{winner === 0 ? 'Throw again' : 'Play again'}</button>
      </div>}
    </div>
  );
}
