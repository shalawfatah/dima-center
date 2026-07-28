import * as migration_20260715_000000_add_case_offers from './20260715_000000_add_case_offers';
import * as migration_20260722_000000_remove_promotions_and_case_offers from './20260722_000000_remove_promotions_and_case_offers';
import * as migration_20260728_161458 from './20260728_161458';

export const migrations = [
  {
    up: migration_20260715_000000_add_case_offers.up,
    down: migration_20260715_000000_add_case_offers.down,
    name: '20260715_000000_add_case_offers',
  },
  {
    up: migration_20260722_000000_remove_promotions_and_case_offers.up,
    down: migration_20260722_000000_remove_promotions_and_case_offers.down,
    name: '20260722_000000_remove_promotions_and_case_offers',
  },
  {
    up: migration_20260728_161458.up,
    down: migration_20260728_161458.down,
    name: '20260728_161458'
  },
];
