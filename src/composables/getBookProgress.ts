import { declineUnit } from '@/composables/declineUnit';

// «13 абзацев · 1 в архиве»
export const getBookProgress = ( total: number, restored: number ): string => `${ total } ${ declineUnit( total, 'passage' ) } · ${ restored } в архиве`;
