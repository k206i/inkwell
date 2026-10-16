import rules from '@/jsons/rules.json';
import type { TRule } from '@/api/getRules';

export type TGetRuleByIdResponse = TRule | null;

export const getRuleById = async ( id: string ): Promise< TGetRuleByIdResponse > => {
  return ( rules as TRule[] ).find( ( rule: TRule ) => rule.id === id ) ?? null;
};
