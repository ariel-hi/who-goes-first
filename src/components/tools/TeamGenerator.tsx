import { useState } from 'react';
import { parseNames, splitTeams } from '../../lib/tools';

export default function TeamGenerator() {
  const [text, setText] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const names = parseNames(text);
  const generate = () => {
    setCopied(false);
    if (names.length < teamCount) { setTeams([]); setError(`Add at least ${teamCount} names for ${teamCount} teams.`); return; }
    setError(''); setTeams(splitTeams(names, teamCount));
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(teams.map((team, i) => `Team ${i + 1}: ${team.join(', ')}`).join('\n')); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <div className="team-tool">
      <label className="tool-label" htmlFor="team-names">Names <span className="muted">(one per line or separated by commas)</span></label>
      <textarea id="team-names" rows={6} value={text} onChange={event => setText(event.target.value)} placeholder={'Alex\nSam\nJordan\nRiley'} />
      <div className="tool-row">
        <label className="tool-label" htmlFor="team-count">Teams</label>
        <select id="team-count" value={teamCount} onChange={event => setTeamCount(Number(event.target.value))}>
          {Array.from({ length: 9 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="small muted">{names.length} {names.length === 1 ? 'name' : 'names'}</span>
      </div>
      <button type="button" className="primary" onClick={generate}>{teams.length ? 'Shuffle again' : 'Make teams'}</button>
      {error && <p className="error" role="alert">{error}</p>}
      {teams.length > 0 && (
        <div role="status" aria-live="polite">
          <ol className="team-list">{teams.map((team, i) => <li key={i}><h3>Team {i + 1}</h3><p>{team.join(', ')}</p></li>)}</ol>
          <button type="button" className="text-button" onClick={copy}>{copied ? 'Copied' : 'Copy teams'}</button>
        </div>
      )}
    </div>
  );
}
