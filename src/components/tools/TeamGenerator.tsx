import { useRef, useState } from 'react';
import { MAX_TEAM_NAMES, parseNames, splitTeams } from '../../lib/tools';

export default function TeamGenerator() {
  const [text, setText] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const revision = useRef(0);
  const names = parseNames(text, true);
  const tooManyNames = names.length > MAX_TEAM_NAMES;
  const limitError = tooManyNames ? 'Add up to 200 names. Remove the extra names to make teams.' : '';
  const invalidate = () => { revision.current++; setTeams([]); setError(''); setCopied(false); };
  const generate = () => {
    revision.current++; setCopied(false);
    if (tooManyNames) { setTeams([]); setError(limitError); return; }
    if (names.length < teamCount) { setTeams([]); setError(`Add at least ${teamCount} names for ${teamCount} teams.`); return; }
    setError(''); setTeams(splitTeams(names, teamCount));
  };
  const copy = async () => {
    const current = revision.current;
    try { await navigator.clipboard.writeText(teams.map((team, i) => `Team ${i + 1}: ${team.join(', ')}`).join('\n')); if (current === revision.current) setCopied(true); } catch { if (current === revision.current) setCopied(false); }
  };
  return (
    <div className="team-tool">
      <label className="tool-label" htmlFor="team-names">Names <span className="muted">(one per line or separated by commas; up to {MAX_TEAM_NAMES} names)</span></label>
      <textarea id="team-names" rows={6} value={text} aria-invalid={Boolean(limitError || error)} aria-describedby={limitError || error ? 'team-error' : undefined} onChange={event => { setText(event.target.value); invalidate(); }} placeholder={'Alex\nSam\nJordan\nRiley'} />
      <div className="tool-row">
        <label className="tool-label" htmlFor="team-count">Teams</label>
        <select id="team-count" value={teamCount} onChange={event => { setTeamCount(Number(event.target.value)); invalidate(); }}>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="small muted">{tooManyNames ? 'More than 200 names' : `${names.length} ${names.length === 1 ? 'name' : 'names'}`}</span>
      </div>
      <button type="button" className="primary" onClick={generate} disabled={tooManyNames}>{teams.length ? 'Shuffle again' : 'Make teams'}</button>
      {(limitError || error) && <p id="team-error" className="error" role="alert">{limitError || error}</p>}
      {teams.length > 0 && (
        <div role="status" aria-live="polite">
          <ol className="team-list">{teams.map((team, i) => <li key={i}><h3>Team {i + 1}</h3><p>{team.join(', ')}</p></li>)}</ol>
          <button type="button" className="text-button" onClick={copy}>{copied ? 'Copied' : 'Copy teams'}</button>
        </div>
      )}
    </div>
  );
}
