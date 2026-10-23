import { existsSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, test } from 'vitest';
import authors from '@/jsons/authors.json';
import { getPassages, type TPassage } from '@/api/getPassages';

const IMAGES_DIR: string = resolve( __dirname, '../../src/assets/img/authors' );

const passages: TPassage[] = await getPassages();

describe( 'авторы', () => {
  test( 'фото и аватарка каждого автора лежат в src/assets/img/authors', () => {
    for ( const author of authors ) {
      expect( existsSync( resolve( IMAGES_DIR, author.photo )), `${ author.id }: ${ author.photo }` ).toBe( true );
      expect( existsSync( resolve( IMAGES_DIR, author.avatar )), `${ author.id }: ${ author.avatar }` ).toBe( true );
    }
  });

  test( 'id произведений не повторяются у всех авторов', () => {
    const ids: string[] = authors.flatMap( ( author ) => author.books.map( ( book ) => book.id ));

    expect( ids.filter( ( id: string, index: number ) => ids.indexOf( id ) !== index )).toEqual( [] );
  });

  // authorId и bookId берутся из имени файла, так тест ловит и неверно названный файл
  test( 'автор и произведение каждого абзаца есть в authors.json', () => {
    for ( const passage of passages ) {
      const author = authors.find( ( item ) => item.id === passage.authorId );
      const hasBook: boolean = author?.books.some( ( book ) => book.id === passage.bookId ) ?? false;

      expect( hasBook, `${ passage.id }: ${ passage.authorId }_${ passage.bookId }.json` ).toBe( true );
    }
  });

  test( 'id абзаца начинается с bookId своего файла', () => {
    for ( const passage of passages ) {
      expect( passage.id.startsWith( `${ passage.bookId }_` ), passage.id ).toBe( true );
    }
  });

  test( 'id абзацев не повторяются во всех файлах', () => {
    const ids: string[] = passages.map( ( passage: TPassage ) => passage.id );

    expect( ids.filter( ( id: string, index: number ) => ids.indexOf( id ) !== index )).toEqual( [] );
  });
});
