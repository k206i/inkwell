import type { TPassage } from '@/api/getPassages';

export type TWorkGroup = {
  work: string,
  passages: TPassage[],
};

export type TAuthorGroup = {
  author: string,
  works: TWorkGroup[],
};

const collator: Intl.Collator = new Intl.Collator( 'ru' );

// Фамилия — последнее слово: «Л. Н. Толстой» → «Толстой»
const getSurname = ( author: string ): string => author.split( ' ' ).pop() ?? author;

// Каталог: авторы по фамилии, произведения по алфавиту, абзацы от лёгкого к сложному
export const groupPassages = ( passages: TPassage[] ): TAuthorGroup[] => {
  const authors: Map< string, Map< string, TPassage[] >> = new Map();

  for ( const passage of passages ) {
    const works: Map< string, TPassage[] > = authors.get( passage.author ) ?? new Map();

    works.set( passage.work, [ ...( works.get( passage.work ) ?? [] ), passage ] );
    authors.set( passage.author, works );
  }

  return [ ...authors ]
    .sort( ( [ a ], [ b ] ) => collator.compare( getSurname( a ), getSurname( b )))
    .map( ( [ author, works ] ): TAuthorGroup => ({
      author,
      works: [ ...works ]
        .sort( ( [ a ], [ b ] ) => collator.compare( a, b ))
        .map( ( [ work, list ] ): TWorkGroup => ({
          work,
          passages: [ ...list ].sort( ( a: TPassage, b: TPassage ) => a.gaps - b.gaps ),
        })),
    }));
};
