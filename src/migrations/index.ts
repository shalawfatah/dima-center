import * as migration_20260703_013936_add_category_image from './20260703_013936_add_category_image';

export const migrations = [
  {
    up: migration_20260703_013936_add_category_image.up,
    down: migration_20260703_013936_add_category_image.down,
    name: '20260703_013936_add_category_image'
  },
];
