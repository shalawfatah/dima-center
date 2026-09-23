import * as migration_20260730_134628_add_general_settings from './20260730_134628_add_general_settings';
import * as migration_20260730_141915_add_general_settings_fields from './20260730_141915_add_general_settings_fields';
import * as migration_20260923_160836_remove_tech_specs_value_locale from './20260923_160836_remove_tech_specs_value_locale';

export const migrations = [
  {
    up: migration_20260730_134628_add_general_settings.up,
    down: migration_20260730_134628_add_general_settings.down,
    name: '20260730_134628_add_general_settings',
  },
  {
    up: migration_20260730_141915_add_general_settings_fields.up,
    down: migration_20260730_141915_add_general_settings_fields.down,
    name: '20260730_141915_add_general_settings_fields',
  },
  {
    up: migration_20260923_160836_remove_tech_specs_value_locale.up,
    down: migration_20260923_160836_remove_tech_specs_value_locale.down,
    name: '20260923_160836_remove_tech_specs_value_locale'
  },
];
