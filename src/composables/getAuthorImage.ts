// Картинка автора по имени файла из authors.json (поля photo и avatar). Vite требует статический литерал в glob
const modules = import.meta.glob(
  '@/assets/img/authors/*.webp',
  { eager: true, query: '?url', import: 'default' }
);

const imageByFile: Map< string, string > = new Map(
  Object.entries( modules ).map( ( [ path, url ] ): [ string, string ] => [ path.split( '/' ).pop() as string, url as string ] )
);

export const getAuthorImage = ( file: string ): string | undefined => imageByFile.get( file );
