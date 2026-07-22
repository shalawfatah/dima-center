import { up as up0 } from './20260715_000000_add_case_offers'
import { up as up1 } from './20260722_000000_remove_promotions_and_case_offers'

export const migrations = [
  {
    up: up0,
    name: '20260715_000000_add_case_offers',
  },
  {
    up: up1,
    name: '20260722_000000_remove_promotions_and_case_offers',
  },
]
