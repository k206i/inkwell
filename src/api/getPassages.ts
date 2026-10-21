import passages from '@/jsons/passages.json';

export type TPassage = {
  id: string,
  title: string, // короткое название по сюжету абзаца, без слов с его пропусками
  author: string,
  authorLink: string,
  work: string,
  workLink: string,
  gaps: number,
  text: string,
};

export type TGetPassagesResponse = TPassage[];

// Каталог идёт от лёгкого к сложному: по числу пропусков
export const getPassages = async (): Promise< TGetPassagesResponse > => [ ...( passages as TPassage[] ) ]
  .sort( ( a: TPassage, b: TPassage ) => a.gaps - b.gaps );
