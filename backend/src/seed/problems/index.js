import easyA from './easy-a.js';
import easyB from './easy-b.js';
import mediumA from './medium-a.js';
import mediumB from './medium-b.js';
import mediumC from './medium-c.js';
import hardA from './hard-a.js';
import hardB from './hard-b.js';
import hardC from './hard-c.js';

/** 300 distinct problems: 100 easy, 130 medium, 70 hard (the badge ladder goes up to 300 solved). */
export const PROBLEM_SPECS = [...easyA, ...easyB, ...mediumA, ...mediumB, ...mediumC, ...hardA, ...hardB, ...hardC];

export default PROBLEM_SPECS;
