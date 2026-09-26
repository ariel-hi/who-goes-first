export interface RuleIndexEntry {
  n: string;
  a: string[];
  e: string;
  s: string;
  r: string;
  p: boolean;
}

let index: Promise<RuleIndexEntry[]> | undefined;

// Search and rule discovery share one on-demand download on the homepage.
export function loadRuleIndex(): Promise<RuleIndexEntry[]> {
  return index ??= fetch('/rule-index.json').then(response => {
    if (!response.ok) throw new Error('Rule index unavailable');
    return response.json() as Promise<RuleIndexEntry[]>;
  }).catch(error => { index = undefined; throw error; });
}
