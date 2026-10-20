import { describe, expect, test } from 'vitest';
import { getWeakRules } from '@/composables/getWeakRules';

describe( 'слабые правила', () => {
  test( 'правила без ошибок не попадают, остальные идут по убыванию ошибок', () => {
    const weak = getWeakRules({
      nn: [ false, false, true, false ],
      vowel: [ true, true, true ],
      'ne-verb': [ true, false ],
    }, 5 );

    expect( weak.map( ( rule ) => rule.ruleId )).toEqual([ 'nn', 'ne-verb' ]);
    expect( weak[0] ).toEqual({ ruleId: 'nn', errors: 3, attempts: 4 });
  });

  test( 'при равном числе ошибок первым идёт правило с большей долей ошибок', () => {
    const weak = getWeakRules({
      spp: [ false, true, true, true ],
      gerund: [ false, true ],
    }, 5 );

    expect( weak.map( ( rule ) => rule.ruleId )).toEqual([ 'gerund', 'spp' ]);
  });

  test( 'список обрезается до лимита', () => {
    const weak = getWeakRules({ a: [ false ], b: [ false ], c: [ false ] }, 2 );

    expect( weak ).toHaveLength( 2 );
  });
});
