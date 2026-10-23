import authors from '@/jsons/authors.json';
import type { TPassage } from '@/api/getPassages';

export type TAuthorBook = {
  id: string, // латиницей через дефис, на него ссылается bookId абзаца
  title: string,
  link: string, // страница произведения в Викитеке
};

export type TAuthor = {
  id: string, // фамилия латиницей, на неё ссылается authorId абзаца
  short: string, // Л. Н. Толстой
  fullName: string, // Лев Николаевич Толстой
  photo: string, // имя файла в src/assets/img/authors
  avatar: string,
  years: string,
  bio: string,
  books: TAuthorBook[],
  wikiLink: string,
};

export type TGetAuthorsResponse = TAuthor[];

export const getAuthors = async (): Promise< TGetAuthorsResponse > => authors as TAuthor[];

export type TPassageSource = {
  author: TAuthor | null,
  book: TAuthorBook | null,
};

export const getPassageSource = ( list: TAuthor[], passage: TPassage ): TPassageSource => {
  const author: TAuthor | null = list.find( ( item: TAuthor ) => item.id === passage.authorId ) ?? null;

  return {
    author,
    book: author?.books.find( ( book: TAuthorBook ) => book.id === passage.bookId ) ?? null,
  };
};
