import type { TAuthor, TAuthorBook } from '@/api/getAuthors';
import type { TPassage } from '@/api/getPassages';

export type TBookGroup = {
  book: TAuthorBook,
  passages: TPassage[],
};

export type TAuthorGroup = {
  author: TAuthor,
  books: TBookGroup[],
};

const collator: Intl.Collator = new Intl.Collator( 'ru' );

// Фамилия — последнее слово: «Л. Н. Толстой» → «Толстой»
const getSurname = ( author: TAuthor ): string => author.short.split( ' ' ).pop() ?? author.short;

// Каталог: авторы по фамилии, произведения по алфавиту, абзацы от лёгкого к сложному.
// Авторы и произведения без абзацев не показываются
export const groupPassages = ( passages: TPassage[], authors: TAuthor[] ): TAuthorGroup[] => [ ...authors ]
  .sort( ( a: TAuthor, b: TAuthor ) => collator.compare( getSurname( a ), getSurname( b )))
  .map( ( author: TAuthor ): TAuthorGroup => ({
    author,
    books: [ ...author.books ]
      .sort( ( a: TAuthorBook, b: TAuthorBook ) => collator.compare( a.title, b.title ))
      .map( ( book: TAuthorBook ): TBookGroup => ({
        book,
        passages: passages
          .filter( ( passage: TPassage ) => passage.authorId === author.id && passage.bookId === book.id )
          .sort( ( a: TPassage, b: TPassage ) => a.gaps - b.gaps ),
      }))
      .filter( ( group: TBookGroup ) => group.passages.length > 0 ),
  }))
  .filter( ( group: TAuthorGroup ) => group.books.length > 0 );
