define(require => {
  let _ = require('lodash');

  let cache = {};
  let watchFunctions = {};
  let idCounter = 1;

  class Cache {

    /**
     * Set cache key to the given value and trigger watch functions.
     * @param {String} key - Cache key.
     * @param {any} value - Value assigned to the given cache key.
     */
    static set(key, value) {
      let watchOnceFunctionIds = [];
      let previousValue = cache[key];

      cache[key] = value;

      _.each(watchFunctions[key], watchFunction => {
        watchFunction.callback(value, previousValue);
        if (watchFunction.once) watchOnceFunctionIds.push(watchFunction.id);
      });
      _.remove(watchFunctions[key], watchFunction =>
        _.includes(watchOnceFunctionIds, watchFunction.id));
    }

    /**
     * Get cache value by given key.
     * @param {String} key - Cache key.
     * @returns {any} Value assigned to the given cache key.
     */
    static get(key) {
      return cache[key];
    }

    /**
     * Clear cache.
     */
    static clear() {
      cache = {};
    }

    /**
     * Watch cache key and trigger `callback` function if changed.
     * @param {String} key - Cache key.
     * @param {Function} callback - Callback function to be triggered on change.
     */
    static watch(key, callback) {
      watchFunctions[key] = watchFunctions[key] || [];
      watchFunctions[key].push({callback: callback, once: false, id: idCounter});
      idCounter += 1;
    }

    /**
     * Watch cache key and trigger `callback` function only once if changed.
     * @param {String} key - Cache key.
     * @param {Function} callback - Callback function to be triggered on change.
     */
    static watchOnce(key, callback) {
      watchFunctions[key] = watchFunctions[key] || [];
      watchFunctions[key].push({callback: callback, once: true, id: idCounter});
      idCounter += 1;
    }
  }

  return Cache;
});
