import { describe, expect, test } from 'vitest';
import { getPassageRules } from '@/composables/getPassageRules';
import rules from '@/jsons/rules.json';

describe( 'правила абзаца', () => {
  test( 'сначала самые частые, при равенстве встретившиеся раньше', () => {
    const text: string = 'освежё[нн|н#nn]ою л[и|е#vowel]цом, стенами[,|#spp] освеще[нн|н#nn]ым г[о|а#vowel]стиную ч[а|я#cha-chu]йного';

    expect( getPassageRules( text )).toEqual([ 'nn', 'vowel', 'spp', 'cha-chu' ]);
  });

  test( 'у каждого правила есть короткое название для карточки', () => {
    for ( const rule of rules ) {
      expect( rule.short?.trim(), rule.id ).toBeTruthy();
    }
  });
});
