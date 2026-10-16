import { describe, expect, test } from 'vitest';
import { fillGaps, getGaps, parseGaps } from '@/composables/parseGaps';
import passages from '@/jsons/passages.json';
import rules from '@/jsons/rules.json';
import { appVars } from '@/configApp';

describe( 'разметка пропусков', () => {
  test( 'буква с правилом: первый вариант правильный', () => {
    const gaps = getGaps( parseGaps( 'г[о|а#vowel]стиную' ));

    expect( gaps ).toEqual([ { index: 0, answer: 'о', options: [ 'о', 'а' ], ruleId: 'vowel' } ]);
  });

  test( 'подчёркивание — пробел, пустой вариант — «ничего»', () => {
    const parts = parseGaps( 'не[_|]знал, то[|_]же' );

    expect( getGaps( parts ).map( ( gap ) => gap.options )).toEqual([ [ ' ', '' ], [ '', ' ' ] ]);
    expect( fillGaps( parts, [ ' ', '' ] )).toBe( 'не знал, тоже' );
  });

  test( 'в абзацах число пропусков совпадает с полем gaps, а правила существуют', () => {
    const ruleIds: Set< string > = new Set( rules.map( ( rule ) => rule.id ));

    for ( const passage of passages ) {
      const gaps = getGaps( parseGaps( passage.text ));

      expect( gaps, passage.id ).toHaveLength( passage.gaps );

      for ( const gap of gaps ) {
        expect( ruleIds.has( gap.ruleId ), `${ passage.id }: ${ gap.ruleId }` ).toBe( true );
      }
    }
  });

  test( 'в абзаце не меньше пропусков, чем капель за ответ у автомата, и не больше ёмкости чернильницы', () => {
    for ( const passage of passages ) {
      expect( passage.gaps, passage.id ).toBeGreaterThanOrEqual( appVars.machine.dropsPerAnswer );
      expect( passage.gaps, passage.id ).toBeLessThanOrEqual( appVars.inkwell.capacity );
    }
  });

  test( 'в каждом вопросе правила есть пропуск хотя бы с двумя вариантами', () => {
    for ( const rule of rules ) {
      for ( const question of rule.questions ) {
        const gaps = getGaps( parseGaps( question ));

        expect( gaps.length, question ).toBeGreaterThan( 0 );
        expect( gaps.every( ( gap ) => gap.options.length > 1 ), question ).toBe( true );
      }
    }
  });
});
