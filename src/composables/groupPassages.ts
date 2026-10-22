import type { TAuthor } from '@/api/getAuthors';
import type { TPassage } from '@/api/getPassages';

export type TWorkGroup = {
  work: string,
  passages: TPassage[],
};

export type TAuthorGroup = {
  author: TAuthor,
  works: TWorkGroup[],
};

const collator: Intl.Collator = new Intl.Collator( 'ru' );

// Фамилия — последнее слово: «Л. Н. Толстой» → «Толстой»
const getSurname = ( author: TAuthor ): string => author.short.split( ' ' ).pop() ?? author.short;

// Каталог: авторы по фамилии, произведения по алфавиту, абзацы от лёгкого к сложному.
// Абзацы автора, которого нет в authors.json, не показываются
export const groupPassages = ( passages: TPassage[], authors: TAuthor[] ): TAuthorGroup[] => {
  const byAuthor: Map< string, Map< string, TPassage[] >> = new Map();

  for ( const passage of passages ) {
    const works: Map< string, TPassage[] > = byAuthor.get( passage.authorId ) ?? new Map();

    works.set( passage.work, [ ...( works.get( passage.work ) ?? [] ), passage ] );
    byAuthor.set( passage.authorId, works );
  }

  return authors
    .filter( ( author: TAuthor ) => byAuthor.has( author.id ))
    .sort( ( a: TAuthor, b: TAuthor ) => collator.compare( getSurname( a ), getSurname( b )))
    .map( ( author: TAuthor ): TAuthorGroup => ({
      author,
      works: [ ...( byAuthor.get( author.id ) ?? [] ) ]
        .sort( ( [ a ], [ b ] ) => collator.compare( a, b ))
        .map( ( [ work, list ] ): TWorkGroup => ({
          work,
          passages: [ ...list ].sort( ( a: TPassage, b: TPassage ) => a.gaps - b.gaps ),
        })),
    }));
};
