define(() => {
  class Cookie {

    /**
     * Set a cookie with given value and expiration date.
     * @param {String} name - Cookie name.
     * @param {String} value - Value of the cookie.
     * @param {Number} [daysToExpire] - Optional days until the cookie expires.
     *                                  Infinity if not specified.
     */
    static set(name, value, daysToExpire) {
      let expirationDate = new Date();
      let setTimeValue = daysToExpire
        ? expirationDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000)
        : 2147483647000;
      expirationDate.setTime(setTimeValue);
      document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
    }

    /**
     * Get a cookie.
     * @param {String} name - Cookie name.
     * @returns {String|undefined} Cookie value or `undefined` if not found.
     */
    static get(name) {
      let cookie = document.cookie.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
      return cookie ? cookie.pop() : undefined;
    }

    /**
     * Remove a cookie.
     * @param {String} name - Cookie name.
     */
    static remove(name) {
      let expirationDate = new Date();
      expirationDate.setTime(0);
      document.cookie = `${name}=;expires=${expirationDate.toUTCString()};path=/`;
    }
  }

  return Cookie;
});
