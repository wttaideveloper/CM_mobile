import { register } from 'node:module';

register('./alias-hooks.mjs', import.meta.url);

// React Native defines __DEV__ globally; mapper code reads it.
globalThis.__DEV__ = false;
