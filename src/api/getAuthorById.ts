import authors from '@/jsons/authors.json';
import type { TAuthor } from '@/api/getAuthors';

export type TGetAuthorByIdResponse = TAuthor | null;

export const getAuthorById = async ( id: string ): Promise< TGetAuthorByIdResponse > => {
  return ( authors as TAuthor[] ).find( ( author: TAuthor ) => author.id === id ) ?? null;
};
