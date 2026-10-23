export type TDeclineUnit = 'drop' | 'question' | 'gap' | 'error' | 'passage';

// Формы слова: [ 1, 2-4, 5-20 ] — 1 капля, 2 капли, 5 капель
const FORMS: Record< TDeclineUnit, [ string, string, string ] > = {
  drop: [ 'капля', 'капли', 'капель' ],
  question: [ 'вопрос', 'вопроса', 'вопросов' ],
  gap: [ 'пропуск', 'пропуска', 'пропусков' ],
  error: [ 'ошибка', 'ошибки', 'ошибок' ],
  passage: [ 'абзац', 'абзаца', 'абзацев' ],
};

export const declineUnit = ( count: number, type: TDeclineUnit ): string => {
  const forms: [ string, string, string ] = FORMS[type];
  const mod10: number = count % 10;
  const mod100: number = count % 100;

  if ( mod10 === 1 && mod100 !== 11 ) {
    return forms[0];
  }

  if ( mod10 >= 2 && mod10 <= 4 && ( mod100 < 12 || mod100 > 14 )) {
    return forms[1];
  }

  return forms[2];
};
