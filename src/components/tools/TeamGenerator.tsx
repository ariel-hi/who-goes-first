import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MAX_TEAM_NAMES, parseNames, splitTeams } from '../../lib/tools';

export default function TeamGenerator() {
  const [text, setText] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyFallback, setCopyFallback] = useState(false);
  const [draw, setDraw] = useState(0);
  const copyField = useRef<HTMLTextAreaElement>(null);
  const revision = useRef(0);
  const names = parseNames(text, true);
  const tooManyNames = names.length > MAX_TEAM_NAMES;
  const limitError = tooManyNames ? 'Add up to 200 names. Remove the extra names to make teams.' : '';
  const teamText = teams.map((team, i) => `Team ${i + 1}: ${team.join(', ')}`).join('\n');
  useEffect(() => { if (copyFallback) { copyField.current?.focus(); copyField.current?.select(); } }, [copyFallback]);
  const invalidate = () => { revision.current++; setTeams([]); setError(''); setCopied(false); setCopyFallback(false); };
  const generate = () => {
    revision.current++; setCopied(false); setCopyFallback(false);
    if (tooManyNames) { setTeams([]); setError(limitError); return; }
    if (names.length < teamCount) { setTeams([]); setError(`Add at least ${teamCount} names for ${teamCount} teams.`); return; }
    setError(''); setTeams(splitTeams(names, teamCount)); setDraw(value => value + 1);
  };
  const copy = async () => {
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(teamText);
      if (current === revision.current) { setCopied(true); setCopyFallback(false); }
    } catch {
      if (current !== revision.current) return;
      setCopied(false); setCopyFallback(true);
      copyField.current?.focus(); copyField.current?.select();
    }
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
      {teams.length > 0 && <>
        <div role="status" aria-live="polite">
          <ol className="team-list" key={draw}>{teams.map((team, i) => <li key={i} style={{ '--team-index': i } as CSSProperties}><h2>Team {i + 1}</h2><p>{team.join(', ')}</p></li>)}</ol>
        </div>
        <div className="team-copy-actions">
          <button type="button" className="text-button" onClick={copy}>{copied ? 'Copied' : 'Copy teams'}</button>
          {copied && <span className="small muted" role="status">Teams copied to clipboard.</span>}
        </div>
        {copyFallback && <div className="team-copy-fallback">
          <label className="tool-label" htmlFor="team-copy-text">Copy this list manually</label>
          <textarea id="team-copy-text" ref={copyField} value={teamText} rows={Math.min(teamCount + 1, 11)} readOnly onFocus={event => event.currentTarget.select()} onClick={event => event.currentTarget.select()} />
          <p className="small muted">Select the list, then use your device’s Copy command.</p>
        </div>}
      </>}
    </div>
  );
}
