define(['jplug/Class'], (Class) => {

    /**
     * A module containing utility methods used by other modules.
     * @exports jplug/Utils
     */
    const Utils = {

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
         * @param    {string}  string  string to clean
         * @returns  {string}  the cleaned string
         */
        cleanHTML(string) {
            const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
            const allow = ['blockquote', 'code', 'span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'];

            // sanitise LTR / TRL overrides
            string = string.split('&#8237;').join('&amp;#8237;');
            string = string.split('&#8238;').join('&amp;#8238;');

            return string.replace(tags, (a, b) => {
                return allow.indexOf(b.toLowerCase()) > -1 ? a : '';
            });
        },

        /**
         * Convert HTML string to plaintext. Strips tags and translates HTML entities.
         * @param    {string}  html  HTML to convert
         * @returns  {string}  the plaintext of the HTML
         */
        html2text(html) {
            if (!html) return '';

            let doc;

            // use text/html DOMParser
            try {
                const parser = new DOMParser();

                doc = parser.parseFromString(html, 'text/html');
            } catch (ex) { /* noop */ }

            // fallback to document.implementation
            if (!doc)
                try {
                    doc = document.implementation.createHTMLDocument('');
                    if (/<\/?(html|head|body)[>]*>/gi.test(html))
                        doc.documentElement.innerHTML = html;
                    else
                        doc.body.innerHTML = html;

                } catch (ex2) { /* noop */ }

            if (doc) return doc.body.textContent || doc.body.text || doc.body.innerText;

            // fallback to old method (warnings on mixed content)
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
        }
    };

    return Utils;
});
