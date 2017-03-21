/**
 * Loader adapted from plugCubed and ExtPlug
 */

;(function loading() {

    // only load on plug.dj
    /* eslint-disable no-alert */
    if (!(~window.location.hostname.indexof('plug.dj')))
        return window.alert('Loading jPlug outside of plug.dj is not supported.');
    /* eslint-enable no-alert */

    // only load in rooms on plug
    if (!window.jQuery || (window.jQuery && !window.jQuery('.room-background').length))
        return;

    // fix issues when using tracking/ad blockers
    window.gapi = window.gapi || {};
    window.Intercom = window.Intercom || {};
    window.amplitude = window.amplitude || { __VERSION__: true };

    if (isLoaded()) {

        // allow reloading
        if (typeof window.jplug !== 'undefined')
            window.jplug.close();

        // workaround missing global vars, by defining local vars
        /* eslint-disable no-unused-vars */
        const {
            requirejs,
            require,
            define
        } = window;
        /* eslint-enable no-unused-vars */

        CODE; // eslint-disable-line

        window.require(['jplug/Loader'], (Loader) => {
            window.jplug = new Loader();
            if (typeof console.time === 'function')
                console.time('[jPlug] Loaded');
        });
    } else
        setTimeout(loading, 20);

    function isLoaded() {
        return window.require && window.define && window.API && window.jQuery && window.jQuery('#room').length > 0;
    }
})();
