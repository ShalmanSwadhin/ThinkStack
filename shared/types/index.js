/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {*} [data]
 * @property {Object} [error]
 * @property {Object} [meta]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {'student'|'admin'} role
 * @property {Object} [profile]
 * @property {Object} [gamification]
 */

/**
 * @typedef {Object} VisualizerStep
 * @property {string} type
 * @property {number[]} [highlights]
 * @property {number[]} [swaps]
 * @property {string} description
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} pages
 */

export {};
