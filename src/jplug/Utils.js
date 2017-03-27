define(['jplug/Class'], (Class) => {

    /**
     * A module containing utility methods used by other modules.
     * @exports jplug/Utils
     */
    const Utils = Class.extend({

        /**
         * Callback for the map function.
         * @callback  mapCallback
         * @param     {*}       value     value being mapped
         * @param     {string}  property  property in object
         * @param     {Object}  object    current object
         * @returns   {*}  new mapped value
         */

        /**
         * Maps the values of an enumerable object using a callback.
         * @param    {Object}       object    object to map
         * @param    {mapCallback}  callback  function used to map object
         * @returns  {Object}  the mapped object
         */
        map(object, callback) {
            if (object === null || typeof object === 'undefined')
                return null;

            const keys = Object.keys(object);

            for (let i = 0; i < keys.length; i++) {
                let value = object[keys[i]];

                value = callback(value, keys[i], object);
                object[keys[i]] = value;
            }

            return object;
        },

        /**
         * Callback for the find function.
         * @callback  findCallback
         * @param     {*}       value     value being checked
         * @param     {string}  property  property being checked
         * @param     {Object}  object    current object
         * @returns   {boolean}  true if this is what was being looked for
         */

        /**
         * Finds the value of an enumerable object that matches the callback.
         * @param    {Object}        object    object to map
         * @param    {findCallback}  callback  function used to find object
         * @returns  {*}  the found value, or null
         */
        find(object, callback) {
            if (object === null || typeof object === 'undefined')
                return null;

            const keys = Object.keys(object);

            for (let i = 0; i < keys.length; i++) {
                const value = object[keys[i]];

                const matched = callback(value, keys[i], object);

                if (matched)
                    return value;
            }

            return null;
        },

        /**
         * Strip dangerous HTML tags from a string. Also sanitises LTR and RTL text overrides.
         * @param    {string}    string   string to clean
         * @param    {string[]}  [allow]  array of string for allow tags
         * @returns  {string}    the cleaned string
         */
        cleanHTML(string, allow) {
            if (!string) return '';

            const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

            allow = allow || ['blockquote', 'code', 'span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'];

            // sanitise LTR / TRL overrides
            string = string.split('&#8237;').join('&amp;#8237;');
            string = string.split('&#8238;').join('&amp;#8238;');

            return string.replace(tags, (a, b) => {
                return allow.indexOf(b.toLowerCase()) > -1 ? a : '';
            });
        },

        /**
         * Convert an HTML string into plaintext. Strips tags and decodes HTML entities.
         * @param    {string}  html  HTML to convert
         * @returns  {string}  the plaintext of the HTML
         */
        html2text(html) {
            if (!html) return '';

            // strip tags
            html = this.cleanHTML(html, []);

            return $('<div/>')
                .html(html)
                .text();
        },

        /**
         * Escape a string to use in regex.
         * @param    {string}  string  the string to escape
         * @returns  {string}  the string with regex escaped
         */
        escapeRegex(string) {
            return string.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
        },

        /**
         * Replace sections inside a string.
         * @param    {string}                   string             string to replace sections from
         * @param    {Object.<string, string>}  repl               object of { from: to, from2: to2 }
         * @param    {boolean}                  [matchCase=false]  true if cases must match to replace
         * @returns  {string}  the new string
         */
        replace(string, repl, matchCase) {
            if (typeof string !== 'string')
                return null;

            matchCase = matchCase || false;

            const parts = /\{\{([^{}]*?)\}\}/gi;

            if (!matchCase) {
                const tmp = {};
                const keys = Object.keys(repl);

                for (let i = 0; i < keys.length; i++)
                    tmp[keys[i].toLowerCase()] = repl[keys[i]];

                repl = tmp;
            }

            return string.replace(parts, (a, b) => {
                if (b.toLowerCase() in repl)
                    return repl[b.toLowerCase()];

                return a;
            });
        },

        /**
         * Deep merge objects, or arrays.
         * @param    {object}  target  target object, will be modified and returned
         * @param    {object}  obj1    object to merge
         * @param    {object}  [objN]  extra objects to merge
         * @returns  {object}  the merged object (original target)
         */
        merge(target, obj1, ...objN) {
            const objs = [obj1, ...objN];

            const isArray = Array.isArray(target);

            for (let i = 0; i < objs.length; i++) {
                const obj = objs[i];

                if (isArray) {
                    if (Array.isArray(obj))
                        target = [...target, ...obj];

                    continue;
                }

                const keys = Object.keys(obj);

                for (let j = 0; j < keys.length; j++) {
                    const key = keys[j];
                    const val = obj[key];

                    if (typeof val === 'undefined' || val === null)
                        continue;

                    if (typeof target[key] === 'undefined' || target[key] === null) {
                        target[key] = val;
                        continue;
                    }

                    if (Array.isArray(val) && Array.isArray(target[key])) {
                        target[key] = [...target[key], ...val];
                        continue;
                    }

                    if ($.isPlainObject(val) && $.isPlainObject(target[key])) {
                        target[key] = this.merge(target[key], val);
                        continue;
                    }

                    // TODO: review if this is the best action to take for merge (maybe require type match)
                    target[key] = val;
                }
            }

            return target;
        }
    });

    return new Utils();
});
