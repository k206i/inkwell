export type TGap = {
  index: number, // порядковый номер пропуска в тексте
  answer: string, // правильный вариант: '' — ничего, ' ' — пробел
  options: string[], // варианты в порядке разметки, первый правильный
  ruleId: string, // id правила из rules.json, в вопросах правила пусто
};

export type TTextPart =
  | { kind: 'text', value: string }
  | { kind: 'gap', gap: TGap };

// Итог печати пропуска: null — ещё не напечатан или переписан заново
export type TGapResult = 'right' | 'wrong' | null;

const GAP_PATTERN: RegExp = /\[([^\]]*)\]/g;

// Разметка пропуска: г[о|а#vowel]стиную, где _ — пробел, пустой вариант — «ничего», первый вариант - правильный ответ
export const parseGaps = ( source: string ): TTextPart[] => {
  const parts: TTextPart[] = [];
  let last: number = 0;
  let index: number = 0;

  for ( const match of source.matchAll( GAP_PATTERN )) {
    const start: number = match.index ?? 0;

    if ( start > last ) {
      parts.push({ kind: 'text', value: source.slice( last, start ) });
    }

    const [ body, ruleId = '' ] = match[1].split( '#' );
    const options: string[] = body.split( '|' ).map( ( option: string ) => option.replace( /_/g, ' ' ));

    parts.push({ kind: 'gap', gap: { index, answer: options[0], options, ruleId } });
    index += 1;
    last = start + match[0].length;
  }

  if ( last < source.length ) {
    parts.push({ kind: 'text', value: source.slice( last ) });
  }

  return parts;
};

export const getGaps = ( parts: TTextPart[] ): TGap[] => parts.flatMap( ( part: TTextPart ) => part.kind === 'gap' ? [ part.gap ] : [] );

export type TWordChunk =
  | { kind: 'space', value: string }
  | { kind: 'word', parts: TTextPart[] };

// Склеивает куски текста и пропуски без пробела между ними в одно слово, чтобы строка не рвалась посреди слова
export const groupWords = ( parts: TTextPart[] ): TWordChunk[] => {
  const chunks: TWordChunk[] = [];
  let word: TTextPart[] = [];

  const flush = () => {
    if ( word.length ) {
      chunks.push({ kind: 'word', parts: word });
      word = [];
    }
  };

  for ( const part of parts ) {
    if ( part.kind === 'gap' ) {
      word.push( part );

      continue;
    }

    for ( const piece of part.value.split( /(\s+)/ )) {
      if ( !piece ) {
        continue;
      }

      if ( /^\s+$/.test( piece )) {
        flush();
        chunks.push({ kind: 'space', value: piece });

        continue;
      }

      word.push({ kind: 'text', value: piece });
    }
  }

  flush();

  return chunks;
};

export const fillGaps = ( parts: TTextPart[], values: string[] ): string => parts
  .map( ( part: TTextPart ) => part.kind === 'gap' ? values[part.gap.index] : part.value )
  .join( '' );

// Выбор между пробелом и «ничего» проверяет слитное и раздельное написание
export const getOptionLabel = ( option: string, options: string[] ): string => {
  if ( options.includes( ' ' ) && options.includes( '' )) {
    if ( option === ' ' ) {
      return 'раздельно';
    }

    if ( option === '' ) {
      return 'слитно';
    }
  }

  if ( option === '' ) {
    return 'ничего';
  }

  if ( option === ' ' ) {
    return 'пробел';
  }

  return option;
};
