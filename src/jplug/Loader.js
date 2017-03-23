/**
 * Adapted from plugCubed Loader.js class
 */
define(['module', 'jplug/Class', 'jplug/Utils'], (module, Class, Utils) => {
    let loaded = false;

    function __init() {

        // TODO: initialization

        loaded = true;

        if (typeof console.timeEnd === 'function')
            console.timeEnd('[jPlug] Loaded');
    }

    const Loader = Class.extend({
        init() {
            if (loaded)
                return;

            if (typeof window.jplugUserData === 'undefined')
                window.jplugUserData = {};

            // TODO: localization
            // TODO: Lang module load then callback
            $.proxy(__init, this);
        },
        close() {
            if (!loaded)
                return;

            // TODO: disable modules

            // menu
            // settings
            // socket
            // features
            // notifications
            // tickers
            // styling
            // chat

            // TODO: revert overrides

            // undefine loaded modules
            const [base] = module.id.split('/');
            const modules = Object.keys(require.s.contexts._.defined);

            for (let i = 0, j = modules.length; i < j; i++)
                if (modules[i] && Utils.startsWith(modules[i], base))
                    requirejs.undef(modules[i]);

            // TODO: remove injected dom elements

            delete window.jplug;
        }
    });

    return Loader;
});
