export type TWeakRule = {
  ruleId: string,
  errors: number, // ошибок среди последних попыток
  attempts: number,
};

// Слабые правила: с ошибками в окне последних попыток, сначала те, где ошибок больше
export const getWeakRules = ( history: Record< string, boolean[] >, limit: number ): TWeakRule[] => Object.entries( history )
  .map( ( [ ruleId, attempts ]: [ string, boolean[] ] ): TWeakRule => ({
    ruleId,
    errors: attempts.filter( ( isRight: boolean ) => !isRight ).length,
    attempts: attempts.length,
  }))
  .filter( ( rule: TWeakRule ) => rule.errors > 0 )
  .sort( ( a: TWeakRule, b: TWeakRule ) => b.errors - a.errors || b.errors / b.attempts - a.errors / a.attempts )
  .slice( 0, limit );
