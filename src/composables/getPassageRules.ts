import { getGaps, parseGaps } from '@/composables/parseGaps';

// Правила абзаца: сначала те, по которым больше пропусков, при равенстве — встретившиеся раньше
export const getPassageRules = ( text: string ): string[] => {
  const counts: Map< string, number > = new Map();

  for ( const gap of getGaps( parseGaps( text ))) {
    counts.set( gap.ruleId, ( counts.get( gap.ruleId ) ?? 0 ) + 1 );
  }

  return [ ...counts ]
    .sort( ( a: [ string, number ], b: [ string, number ] ) => b[1] - a[1] )
    .map( ( [ ruleId ]: [ string, number ] ) => ruleId );
};
