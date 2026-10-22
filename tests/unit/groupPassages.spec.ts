import { describe, expect, test } from 'vitest';
import { groupPassages } from '@/composables/groupPassages';
import type { TAuthor } from '@/api/getAuthors';
import type { TPassage } from '@/api/getPassages';

const passage = ( id: string, authorId: string, work: string, gaps: number ): TPassage => ({
  id, title: id, authorId, work, workLink: '', gaps, text: '',
});

const author = ( id: string, short: string ): TAuthor => ({
  id, short, fullName: '', photo: '', avatar: '', years: '', bio: '', works: [], wikiLink: '',
});

describe( 'группировка каталога', () => {
  test( 'авторы по фамилии, произведения по алфавиту, абзацы по числу пропусков', () => {
    const authors: TAuthor[] = [
      author( 'tolstoy', 'Л. Н. Толстой' ),
      author( 'pushkin', 'А. С. Пушкин' ),
      author( 'gogol', 'Н. В. Гоголь' ),
      author( 'chekhov', 'А. П. Чехов' ),
    ];

    const groups = groupPassages([
      passage( 'war-2', 'tolstoy', 'Война и мир', 12 ),
      passage( 'onegin', 'pushkin', 'Евгений Онегин', 5 ),
      passage( 'anna', 'tolstoy', 'Анна Каренина', 9 ),
      passage( 'war-1', 'tolstoy', 'Война и мир', 3 ),
      passage( 'dead-souls', 'gogol', 'Мёртвые души', 7 ),
    ], authors );

    // Чехов без абзацев в каталог не попадает
    expect( groups.map( ( group ) => group.author.id )).toEqual([ 'gogol', 'pushkin', 'tolstoy' ]);
    expect( groups[2].works.map( ( work ) => work.work )).toEqual([ 'Анна Каренина', 'Война и мир' ]);
    expect( groups[2].works[1].passages.map( ( item ) => item.id )).toEqual([ 'war-1', 'war-2' ]);
  });
});
