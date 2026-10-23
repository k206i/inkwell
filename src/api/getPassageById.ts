import { getPassages, type TPassage } from '@/api/getPassages';

export type TGetPassageByIdResponse = TPassage | null;

export const getPassageById = async ( id: string ): Promise< TGetPassageByIdResponse > => {
  return ( await getPassages() ).find( ( passage: TPassage ) => passage.id === id ) ?? null;
};
