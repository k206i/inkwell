export type TVisorEmotion =
  'neutral' | 'joy' | 'happiness' | 'delight' | 'laughter' |
  'smile' | 'calm' | 'sadness' | 'anger' | 'irritation' |
  'rage' | 'tiredness' | 'boredom' | 'shock' | 'surprise' |
  'interest' | 'love' | 'curiosity' | 'sleep' | 'overload' |
  'confusion' | 'noise';

export type TVisorStroke = {
  d: string,
  dash: string,
};

type TPoint = [ number, number ];
type TSegment = [ TPoint, TPoint, TPoint ];
type TPart = {
  start: TPoint,
  segments: TSegment[],
};

// Сплошная и пунктирная полоски: одинаковое число значений, чтобы пунктир плавно перетекал
const SOLID: string = '100 0';
const DASHED: string = '7 8';

const lerp = ( a: TPoint, b: TPoint, t: number ): TPoint => [ a[0] + ( b[0] - a[0] ) * t, a[1] + ( b[1] - a[1] ) * t ];

const polyline = ( ...points: TPoint[] ): TPart => {
  const segments: TSegment[] = [];

  for ( let i = 1; i < points.length; i++ ) {
    segments.push( [ lerp( points[i - 1], points[i], 1 / 3 ), lerp( points[i - 1], points[i], 2 / 3 ), points[i] ] );
  }

  return { start: points[0], segments };
};

const line = ( a: TPoint, b: TPoint, count: number ): TPart => {
  const points: TPoint[] = [];

  for ( let i = 0; i <= count; i++ ) {
    points.push( lerp( a, b, i / count ) );
  }

  return polyline( ...points );
};

// Углы в градусах, ось y смотрит вниз: 90 — низ, 270 — верх
const arc = ( cx: number, cy: number, rx: number, ry: number, from: number, to: number, count: number ): TPart => {
  const point = ( a: number ): TPoint => [ cx + rx * Math.cos( a ), cy + ry * Math.sin( a ) ];
  const tangent = ( a: number ): TPoint => [ -rx * Math.sin( a ), ry * Math.cos( a ) ];
  const start: number = from * Math.PI / 180;
  const step: number = ( to - from ) / count * Math.PI / 180;
  const k: number = 4 / 3 * Math.tan( step / 4 );
  const segments: TSegment[] = [];

  for ( let i = 0; i < count; i++ ) {
    const a0: number = start + step * i;
    const a1: number = a0 + step;
    const p0: TPoint = point( a0 );
    const p1: TPoint = point( a1 );
    const t0: TPoint = tangent( a0 );
    const t1: TPoint = tangent( a1 );

    segments.push( [ [ p0[0] + k * t0[0], p0[1] + k * t0[1] ], [ p1[0] - k * t1[0], p1[1] - k * t1[1] ], p1 ] );
  }

  return { start: point( start ), segments };
};

const join = ( ...parts: TPart[] ): TPart => ( {
  start: parts[0].start,
  segments: parts.flatMap( ( part: TPart ) => part.segments ),
} );

const heart = ( cx: number, cy: number, s: number ): TPart => {
  const tip: TPoint = [ cx, cy + 0.55 * s ];

  return {
    start: tip,
    segments: [
      [ [ cx - 0.15 * s, cy + 0.35 * s ], [ cx - 0.5 * s, cy + 0.15 * s ], [ cx - 0.5 * s, cy - 0.1 * s ] ],
      [ [ cx - 0.5 * s, cy - 0.45 * s ], [ cx - 0.05 * s, cy - 0.5 * s ], [ cx, cy - 0.25 * s ] ],
      [ [ cx + 0.05 * s, cy - 0.5 * s ], [ cx + 0.5 * s, cy - 0.45 * s ], [ cx + 0.5 * s, cy - 0.1 * s ] ],
      [ [ cx + 0.5 * s, cy + 0.15 * s ], [ cx + 0.15 * s, cy + 0.35 * s ], tip ],
    ],
  };
};

// Четырёхлучевая искра: дуги между лучами прогибаются к центру
const sparkle = ( cx: number, cy: number, r: number ): TPart => {
  const tips: TPoint[] = [ [ cx, cy - r ], [ cx + r, cy ], [ cx, cy + r ], [ cx - r, cy ], [ cx, cy - r ] ];
  const pull = ( p: TPoint ): TPoint => lerp( [ cx, cy ], p, 0.4 );
  const segments: TSegment[] = [];

  for ( let i = 1; i < tips.length; i++ ) {
    segments.push( [ pull( tips[i - 1] ), pull( tips[i] ), tips[i] ] );
  }

  return { start: tips[0], segments };
};

// Крестик одним росчерком: вторую половину первой диагонали перо проходит дважды, при круглых концах это не видно
const cross = ( cx: number, cy: number, r: number ): TPart => polyline(
  [ cx - r, cy - r ], [ cx + r, cy + r ], [ cx, cy ], [ cx + r, cy - r ], [ cx - r, cy + r ],
);

const question: TPart = join(
  arc( 70, 24, 11, 11, 180, 360, 2 ),
  { start: [ 81, 24 ], segments: [ [ [ 81, 33 ], [ 70, 33 ], [ 70, 41 ] ] ] },
  line( [ 70, 41 ], [ 70, 47 ], 1 ),
);

const toPath = ( part: TPart ): string => {
  const n = ( p: TPoint ): string => `${ p[0].toFixed( 2 ) } ${ p[1].toFixed( 2 ) }`;

  return `M ${ n( part.start ) }` + part.segments.map( ( s: TSegment ) => ` C ${ n( s[0] ) } ${ n( s[1] ) } ${ n( s[2] ) }` ).join( '' );
};

const face = ( left: TPart, right: TPart, dash: string = SOLID ): [ TVisorStroke, TVisorStroke ] => [
  { d: toPath( left ), dash },
  { d: toPath( right ), dash },
];

// Бокс 140×100 повторяет пропорции визора. Каждая полоска — старт и четыре кривые,
// одиночные фигуры собираются из двух половинок, которые встречаются в центре
export const visorFaces: Record<TVisorEmotion, [ TVisorStroke, TVisorStroke ]> = {
  neutral: face( line( [ 24, 40 ], [ 70, 40 ], 4 ), line( [ 70, 40 ], [ 116, 40 ], 4 ) ),
  joy: face( arc( 70, 66, 40, 33, 160, 90, 4 ), arc( 70, 66, 40, 33, 90, 20, 4 ) ),
  happiness: face(
    polyline( [ 24, 48 ], [ 31.5, 41 ], [ 39, 34 ], [ 46.5, 41 ], [ 54, 48 ] ),
    polyline( [ 86, 48 ], [ 93.5, 41 ], [ 101, 34 ], [ 108.5, 41 ], [ 116, 48 ] ),
  ),
  delight: face( sparkle( 39, 38, 16 ), sparkle( 101, 38, 16 ) ),
  laughter: face(
    polyline( [ 25, 26 ], [ 36, 32 ], [ 47, 38 ], [ 36, 44 ], [ 25, 50 ] ),
    polyline( [ 115, 26 ], [ 104, 32 ], [ 93, 38 ], [ 104, 44 ], [ 115, 50 ] ),
  ),
  smile: face( arc( 39, 46, 15, 13, 200, 340, 4 ), arc( 101, 46, 15, 13, 200, 340, 4 ) ),
  calm: face( arc( 39, 42, 12, 6, 200, 340, 4 ), arc( 101, 42, 12, 6, 200, 340, 4 ) ),
  sadness: face( arc( 70, 98, 40, 22, 200, 270, 4 ), arc( 70, 98, 40, 22, 270, 340, 4 ) ),
  anger: face( line( [ 26, 14 ], [ 70, 42 ], 4 ), line( [ 70, 42 ], [ 114, 14 ], 4 ) ),
  irritation: face( line( [ 26, 22 ], [ 60, 34 ], 4 ), line( [ 80, 34 ], [ 114, 22 ], 4 ) ),
  rage: face(
    polyline( [ 24, 20 ], [ 35.5, 31 ], [ 47, 42 ], [ 58.5, 33 ], [ 70, 24 ] ),
    polyline( [ 70, 24 ], [ 81.5, 33 ], [ 93, 42 ], [ 104.5, 31 ], [ 116, 20 ] ),
  ),
  tiredness: face( line( [ 24, 40 ], [ 70, 40 ], 4 ), line( [ 70, 40 ], [ 116, 40 ], 4 ), DASHED ),
  boredom: face( line( [ 38, 82 ], [ 70, 82 ], 4 ), line( [ 70, 82 ], [ 102, 82 ], 4 ) ),
  shock: face( arc( 70, 80, 18, 18, 90, 270, 4 ), arc( 70, 80, 18, 18, 270, 450, 4 ) ),
  surprise: face( arc( 39, 38, 13, 13, 180, 540, 4 ), arc( 101, 38, 13, 13, 180, 540, 4 ) ),
  interest: face( line( [ 52, 48 ], [ 70, 30 ], 4 ), line( [ 70, 30 ], [ 88, 48 ], 4 ) ),
  love: face( heart( 39, 38, 30 ), heart( 101, 38, 30 ) ),
  curiosity: face( question, line( [ 70, 59 ], [ 70, 59.01 ], 4 ) ),
  sleep: face( line( [ 32, 50 ], [ 70, 50 ], 4 ), line( [ 70, 50 ], [ 108, 50 ], 4 ) ),
  overload: face( cross( 39, 38, 10 ), cross( 101, 38, 10 ) ),
  confusion: face( arc( 35, 16, 14, 9, 200, 340, 4 ), arc( 105, 18, 16, 6, 154, 26, 4 ) ),
  noise: face(
    polyline( [ 24, 46 ], [ 35.5, 34 ], [ 47, 46 ], [ 58.5, 34 ], [ 70, 46 ] ),
    polyline( [ 70, 46 ], [ 81.5, 34 ], [ 93, 46 ], [ 104.5, 34 ], [ 116, 46 ] ),
  ),
};
