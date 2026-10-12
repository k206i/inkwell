import { describe, expect, test } from 'vitest';
import { visorFaces } from '@/components/Visor/visorFaces';

// Форма плавно перетекает, только если у всех путей одинаковый набор команд
const PATH_SHAPE: RegExp = /^M -?\d+\.\d\d -?\d+\.\d\d( C( -?\d+\.\d\d){6}){4}$/;

describe( 'эмоции визора', () => {
  test( 'у каждой эмоции две полоски с одинаковой структурой пути', () => {
    for ( const [ emotion, strokes ] of Object.entries( visorFaces ) ) {
      expect( strokes, emotion ).toHaveLength( 2 );

      for ( const stroke of strokes ) {
        expect( stroke.d, emotion ).toMatch( PATH_SHAPE );
      }
    }
  });
});
