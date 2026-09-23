import { getCoverage } from '../src/lib/content/coverage';
const coverage = getCoverage();
console.log(`${coverage.games.length} discovered game identities; ${coverage.researched} have a researched edition; ${coverage.pending} still need primary-source research. ${coverage.ruleCount} researched rule records in total. Identities are not completed rules; research is not publication approval.`);
