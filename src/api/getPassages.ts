export type TPassage = {
  id: string, // bookId_абзац
  title: string, // короткое название по сюжету абзаца, без слов с его пропусками
  authorId: string, // id автора из authors.json
  bookId: string, // id произведения из books автора
  gaps: number,
  text: string,
};

type TPassageFile = Omit< TPassage, 'authorId' | 'bookId' >[];

export type TGetPassagesResponse = TPassage[];

const files: Record< string, TPassageFile > = import.meta.glob< TPassageFile >( '@/jsons/passages/*.json', { eager: true, import: 'default' } );

// Автор и произведение берутся из имени файла: tolstoy_war-and-peace.json
const passages: TPassage[] = Object.entries( files ).flatMap( ( [ path, list ] ): TPassage[] => {
  const [ authorId, bookId ] = ( path.split( '/' ).pop() as string ).replace( '.json', '' ).split( '_' );

  return list.map( ( passage ): TPassage => ({ ...passage, authorId, bookId }));
});

// Каталог идёт от лёгкого к сложному: по числу пропусков
export const getPassages = async (): Promise< TGetPassagesResponse > => [ ...passages ]
  .sort( ( a: TPassage, b: TPassage ) => a.gaps - b.gaps );
