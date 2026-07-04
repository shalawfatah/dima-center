import * as migration_20260704_205950_add_missing_product_fields from './20260704_205950_add_missing_product_fields';

export const migrations = [
  {
    up: migration_20260704_205950_add_missing_product_fields.up,
    down: migration_20260704_205950_add_missing_product_fields.down,
    name: '20260704_205950_add_missing_product_fields'
  },
];
