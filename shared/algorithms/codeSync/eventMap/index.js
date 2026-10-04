import { SEARCHING } from './searching.js';
import { SORTING } from './sorting.js';
import { GRAPHS } from './graphs.js';
import { TREES } from './trees.js';
import { STRUCTURES } from './structures.js';
import { TECHNIQUES } from './techniques.js';
import { DP } from './dp.js';

export const EVENT_MAP = {
  ...SEARCHING,
  ...SORTING,
  ...GRAPHS,
  ...TREES,
  ...STRUCTURES,
  ...TECHNIQUES,
  ...DP,
};

export default EVENT_MAP;
