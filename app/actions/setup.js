// @flow
import type { GetState, Dispatch } from '../reducers/types';

export const VIAL_SELECT = 'VIAL_SELECT';

export function vialSelection() {
  return {
    type: VIAL_SELECT
  };
}
