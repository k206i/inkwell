import rules from '@/jsons/rules.json';

export type TRuleExample = {
  text: string, // выделенный фрагмент обёрнут в *звёздочки*
  source: string,
  link: string,
};

export type TRule = {
  id: string,
  section: string,
  title: string,
  hint: string,
  text: string[],
  exceptions: string[],
  examples: TRuleExample[],
  questions: string[],
  reference: string,
};

export type TGetRulesResponse = TRule[];

export const getRules = async (): Promise< TGetRulesResponse > => rules as TRule[];
