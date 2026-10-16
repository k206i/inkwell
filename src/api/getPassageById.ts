import passages from '@/jsons/passages.json';
import type { TPassage } from '@/api/getPassages';

export type TGetPassageByIdResponse = TPassage | null;

export const getPassageById = async ( id: string ): Promise< TGetPassageByIdResponse > => {
  return ( passages as TPassage[] ).find( ( passage: TPassage ) => passage.id === id ) ?? null;
};
