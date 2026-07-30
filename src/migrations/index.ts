import * as migration_20260730_134628_add_general_settings from './20260730_134628_add_general_settings';

export const migrations = [
  {
    up: migration_20260730_134628_add_general_settings.up,
    down: migration_20260730_134628_add_general_settings.down,
    name: '20260730_134628_add_general_settings'
  },
];
