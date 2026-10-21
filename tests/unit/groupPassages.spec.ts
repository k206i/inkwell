import { describe, expect, test } from 'vitest';
import { groupPassages } from '@/composables/groupPassages';
import type { TPassage } from '@/api/getPassages';

const passage = ( id: string, author: string, work: string, gaps: number ): TPassage => ({
  id, title: id, author, authorLink: '', work, workLink: '', gaps, text: '',
});

describe( 'группировка каталога', () => {
  test( 'авторы по фамилии, произведения по алфавиту, абзацы по числу пропусков', () => {
    const groups = groupPassages([
      passage( 'war-2', 'Л. Н. Толстой', 'Война и мир', 12 ),
      passage( 'onegin', 'А. С. Пушкин', 'Евгений Онегин', 5 ),
      passage( 'anna', 'Л. Н. Толстой', 'Анна Каренина', 9 ),
      passage( 'war-1', 'Л. Н. Толстой', 'Война и мир', 3 ),
      passage( 'dead-souls', 'Н. В. Гоголь', 'Мёртвые души', 7 ),
    ]);

    expect( groups.map( ( group ) => group.author )).toEqual([ 'Н. В. Гоголь', 'А. С. Пушкин', 'Л. Н. Толстой' ]);
    expect( groups[2].works.map( ( work ) => work.work )).toEqual([ 'Анна Каренина', 'Война и мир' ]);
    expect( groups[2].works[1].passages.map( ( item ) => item.id )).toEqual([ 'war-1', 'war-2' ]);
  });
});
