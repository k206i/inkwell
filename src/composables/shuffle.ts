export const shuffle = < T >( items: T[] ): T[] => {
  const result: T[] = [ ...items ];

  for ( let i = result.length - 1; i > 0; i-- ) {
    const j: number = Math.floor( Math.random() * ( i + 1 ));

    [ result[i], result[j] ] = [ result[j], result[i] ];
  }

  return result;
};
