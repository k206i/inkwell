import { existsSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, test } from 'vitest';
import authors from '@/jsons/authors.json';
import passages from '@/jsons/passages.json';

const IMAGES_DIR: string = resolve( __dirname, '../../src/assets/img/authors' );

describe( 'авторы', () => {
  test( 'фото и аватарка каждого автора лежат в src/assets/img/authors', () => {
    for ( const author of authors ) {
      expect( existsSync( resolve( IMAGES_DIR, author.photo )), `${ author.id }: ${ author.photo }` ).toBe( true );
      expect( existsSync( resolve( IMAGES_DIR, author.avatar )), `${ author.id }: ${ author.avatar }` ).toBe( true );
    }
  });

  test( 'authorId каждого абзаца есть в authors.json', () => {
    const ids: Set< string > = new Set( authors.map( ( author ) => author.id ));

    for ( const passage of passages ) {
      expect( ids.has( passage.authorId ), `${ passage.id }: ${ passage.authorId }` ).toBe( true );
    }
  });
});
