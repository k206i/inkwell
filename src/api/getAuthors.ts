import authors from '@/jsons/authors.json';

export type TAuthorWork = {
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
  works: TAuthorWork[],
  wikiLink: string,
};

export type TGetAuthorsResponse = TAuthor[];

export const getAuthors = async (): Promise< TGetAuthorsResponse > => authors as TAuthor[];
