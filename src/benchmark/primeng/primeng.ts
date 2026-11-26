import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

/**
 * PrimeNG is styled through its provider: the Aura preset is the one its
 * documentation starts with. `darkModeSelector: false` keeps the light
 * colours whatever the system setting is, like in the other pages.
 */
export const primeNgProviders = [
  providePrimeNG({
    theme: {
      preset: Aura,
      options: { darkModeSelector: false },
    },
  }),
];
