import { reactive, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { appVars } from '@/configApp';

type TAppStore = {
  ink: number, // капли в чернильнице, не больше appVars.inkwell.capacity
  tokens: number, // жетоны знания
  restoredPassages: string[], // id абзацев, ушедших в архив
}

const STORAGE_KEY: string = 'appStore';

export const appStore: TAppStore = reactive({
  ink: appVars.inkwell.capacity,
  tokens: 0,
  restoredPassages: [],
});

export const restoreAppStore = async (): Promise< void > => {
  const { value } = await Preferences.get({ key: STORAGE_KEY });

  if ( !value ) {
    return;
  }

  try {
    Object.assign( appStore, JSON.parse( value ));
  } catch {
    // Повреждённые данные игнорируем, стор останется с дефолтами
  }
};

export const addInk = ( drops: number ): void => {
  appStore.ink = Math.min( appStore.ink + drops, appVars.inkwell.capacity );
};

export const spendInk = ( drops: number ): void => {
  appStore.ink = Math.max( 0, appStore.ink - drops );
};

// Жетон знания только за первое восстановление абзаца. Возвращает, выдан ли жетон
export const archivePassage = ( id: string ): boolean => {
  if ( appStore.restoredPassages.includes( id )) {
    return false;
  }

  appStore.restoredPassages.push( id );
  appStore.tokens += 1;

  return true;
};

export const spendToken = (): void => {
  if ( appStore.tokens < 1 ) {
    return;
  }

  appStore.tokens -= 1;
  appStore.ink = appVars.inkwell.capacity;
};

// Автосохранение при любом изменении стора
watch( appStore, () => {
  Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify( appStore ),
  });
});
