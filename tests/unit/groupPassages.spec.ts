import { describe, expect, test } from 'vitest';
import { groupPassages } from '@/composables/groupPassages';
import type { TAuthor, TAuthorBook } from '@/api/getAuthors';
import type { TPassage } from '@/api/getPassages';

const passage = ( id: string, authorId: string, bookId: string, gaps: number ): TPassage => ({
  id, title: id, authorId, bookId, gaps, text: '',
});

const book = ( id: string, title: string ): TAuthorBook => ({ id, title, link: '' });

const author = ( id: string, short: string, books: TAuthorBook[] ): TAuthor => ({
  id, short, fullName: '', photo: '', avatar: '', years: '', bio: '', books, wikiLink: '',
});

describe( 'группировка каталога', () => {
  test( 'авторы по фамилии, произведения по алфавиту, абзацы по числу пропусков', () => {
    const authors: TAuthor[] = [
      author( 'tolstoy', 'Л. Н. Толстой', [
        book( 'war-and-peace', 'Война и мир' ),
        book( 'resurrection', 'Воскресение' ),
        book( 'anna-karenina', 'Анна Каренина' ),
      ]),
      author( 'pushkin', 'А. С. Пушкин', [ book( 'onegin', 'Евгений Онегин' ) ]),
      author( 'gogol', 'Н. В. Гоголь', [ book( 'dead-souls', 'Мёртвые души' ) ]),
      author( 'chekhov', 'А. П. Чехов', [ book( 'seagull', 'Чайка' ) ]),
    ];

    const groups = groupPassages([
      passage( 'war-2', 'tolstoy', 'war-and-peace', 12 ),
      passage( 'onegin', 'pushkin', 'onegin', 5 ),
      passage( 'anna', 'tolstoy', 'anna-karenina', 9 ),
      passage( 'war-1', 'tolstoy', 'war-and-peace', 3 ),
      passage( 'dead-souls', 'gogol', 'dead-souls', 7 ),
    ], authors );

    // Чехов и «Воскресение» без абзацев в каталог не попадают
    expect( groups.map( ( group ) => group.author.id )).toEqual([ 'gogol', 'pushkin', 'tolstoy' ]);
    expect( groups[2].books.map( ( group ) => group.book.title )).toEqual([ 'Анна Каренина', 'Война и мир' ]);
    expect( groups[2].books[1].passages.map( ( item ) => item.id )).toEqual([ 'war-1', 'war-2' ]);
  });
});
