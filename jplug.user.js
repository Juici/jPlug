// ==UserScript==
// @name        jPlug
// @namespace   github.com/Juici/jPlug
// @author      Juici
// @version     0.1.0

// @downloadURL https://juici.github.io/jPlug/jplug.user.js

// @include     https://plug.dj/*
// @include     https://*.plug.dj/*

// @exclude     https://plug.dj/_/*
// @exclude     https://plug.dj/@/*
// @exclude     https://plug.dj/ba
// @exclude     https://plug.dj/plot
// @exclude     https://plug.dj/press
// @exclude     https://plug.dj/partners
// @exclude     https://plug.dj/team
// @exclude     https://plug.dj/about
// @exclude     https://plug.dj/jobs
// @exclude     https://plug.dj/purchase
// @exclude     https://plug.dj/subscribe
// @exclude     https://*.plug.dj/_/*
// @exclude     https://*.plug.dj/@/*
// @exclude     https://*.plug.dj/ba
// @exclude     https://*.plug.dj/plot
// @exclude     https://*.plug.dj/press
// @exclude     https://*.plug.dj/partners
// @exclude     https://*.plug.dj/team
// @exclude     https://*.plug.dj/about
// @exclude     https://*.plug.dj/jobs
// @exclude     https://*.plug.dj/purchase
// @exclude     https://*.plug.dj/subscribe

// @grant       none
// @run-at      document-start
// ==/UserScript==

(function ($) {
  const loader = {
    hook: function () {
      if (typeof API !== 'undefined' && API.enabled) {
        this.load();
      } else {
        setTimeout(this.hook, 500);
      }
    },
    load: function () {
      console.log('[jPlug] autoload enabled');
      API.chatLog('jPlug autoload enabled');
      $.getScript('https://juici.github.io/jPlug/jplug.min.js').fail((e) => console.log(`[jPlug] autoload failed: ${e}`));
    }
  };
})(window.jQuery);
