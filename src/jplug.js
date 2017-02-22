// requirejs hooks
function iterate(match, test) {
  if (typeof match !== 'object' || typeof test !== 'object')
    return false;
  for (const prop in match) {
    if (match.hasOwnProperty(prop)) {
      if (typeof match[prop] === 'object') {
        if (!iterate(match[prop], test[prop])) {
          return false;
        }
      } else {
        if ((typeof test[prop]).toLowerCase() !== match[prop].toLowerCase()) {
          return false;
        }
      }
    }
  }
  return true;
}

function getModule(obj) {
  const modules = require.s.contexts._.defined;
  for (const prop in modules) {
    if (modules.hasOwnProperty(prop)) {
      const module = modules[prop];
      if (iterate(obj, module)) {
        return module;
      }
    }
  }
}

/* globals _$context, PlugTime, PlugSettings */
typeof _$context === 'undefined' && (_$context = getModule({ _events: { 'AlertEvent:alert': 'object' }, dispatch: 'function' }));
typeof PlugTime === 'undefined' && (PlugTime = getModule({ getChatTimestamp: 'function' }));
typeof PlugSettings === 'undefined' && (PlugSettings = getModule({ settings: 'object' }));
// end requirejs

if (typeof jplug !== 'undefined')
  jplug.__close();

window.jplugLoad = {
  start: 0,
  end: 0
};

window.jplug = {
  version: {
    major: null,
    minor: null,
    patch: null,
    notes: null
  },

  files: {
    // TODO: automate minify and version
    js: 'https://juici.github.io/jPlug/dist/jplug.js',
    css: 'https://juici.github.io/jPlug/dist/jplug.css',
    version: 'https://juici.github.io/jPlug/dist/version.json'
  },

  running: false,
  other: {
    afk: {
      enabled: false,
      message: null
    }
  },

  /** Settings
  --------------------------------------------------*/

  settings: {
    mod: {
      chatLog: false,
      historyAlert: false,
      lengthAlert: false,
      songAvailability: true, // TODO
      deletedChat: true
    },
    debug: true,
    custom: {
      sounds: {
        // TODO
      },
      mentions: {
        enabled: false, // TODO
        match: []
      },
      colors: {
        // TODO
      },
      afk: {
        reason: ':o where am i???',
        message: '/me is afk ( %%reason%% ) right now @%%user%% - sorry kiddo',
        start: '/me is now afk ( %%reason%% ) - quick, mention them as much as possible',
        stop: '/me is no longer afk :o'
      },

      // TODO: move this stuff (temporarily here)
      gif: {
        petme: 'https://i.imgur.com/lU5Pf7b.gif',
        lick: 'https://i.imgur.com/x7If57b.gif',
        dio: 'https://i.imgur.com/JkXpkWe.gif',

        bye: 'https://i.imgur.com/4jWtDX6.gif',
        byeflip: 'https://i.imgur.com/hKcRui2.gif',

        steal: 'https://i.imgur.com/tX0XW8a.gif',

        // taiga
        clap: 'https://i.imgur.com/F29Li2R.gif',
        notlikethis: 'https://i.imgur.com/ZLx9gHr.gif'
      },
      meme: {
        steal: 'https://i.imgur.com/NVpmaKa.png',
        deadchat: 'https://i.imgur.com/lP7gPtd.jpg',
        diokong: 'https://i.imgur.com/brnWOIZ.png',
        diobass: 'https://i.imgur.com/Wp8K8IB.png'
      }
    }
  },

  /** Util Methods
  --------------------------------------------------*/

  utils: {
    _sandboxDocument: null,
    htmlentities: function (text) {
      let doc = jplug.utils._sandboxDocument;
      if (!doc || typeof doc === 'undefined' || doc === null)
        doc = jplug.utils._sandboxDocument = document.implementation.createHTMLDocument('jplug-sandbox');
      const tmp = doc.createElement('div');
      tmp.innerHTML = text;
      return tmp.textContent || tmp.text || tmp.innerText || '';
    },
    striphtml: function (text) {
      return text.replace(/<.*?>.*?<\/.*?>/gi, '');
    },
    debug: function (log, error) {
      if (jplug.settings.debug) {
        if ($('#jplug-dev-log').size() === 0) {
          $('#playback').after(`<div id="jplug-dev-log" style="position:absolute; top:${$('.app-header').height() + 20}px; left:20px; width:250px; max-height: 600px; overflow-y:auto; padding:10px; color: #fff; background-color:rgba(20,20,20,.8); font-size:12px; text-align:left; z-index:100000"><strong>jPlug Dev Log</strong></div>`);
        }
        typeof log !== 'undefined' && log !== null && (console.log('[jPlug]', log), $('#jplug-dev-log').append(`<div>${log}</div>`));
        typeof error !== 'undefined' && error !== null && (console.error('[jPlug]', error), $('#jplug-dev-log').append(`<div style="color: #c42e3b;">${error}</div>`));
      }
    },
    loadSettings: function () {
      jplug.utils.debug('Loading settings...');
      $.extend(jplug.settings, JSON.parse(localStorage.getItem('jplug-settings')) || {});
    },
    saveSettings: function () {
      localStorage.setItem('jplug-settings', JSON.stringify(jplug.settings));
      jplug.utils.debug('[settings] Settings saved');
    },
    checkLoad: function () {
      const loader = {
        hook: function () {
          jplug.utils.debug('[checkLoad] Checking load...');

          if ($('.loading-box').size() === 0 && typeof rcs !== 'undefined' && rcs.running) {
            this.load();
          } else {
            jplug.utils.debug('[jplug] [checkLoad] Not yet loaded');
            setTimeout(() =>  loader.hook(), 250);
          }
        },
        load: function () {
          jplug.utils.getFiles(jplug.__init);
          jplug.utils.debug('[checkLoad] Loaded');
        }
      };
      loader.hook();
    },
    getFiles: function (callback) {
      callback = callback || function () {};

      $('head').append('<style id="jplug-anchor"></style>');

      jplug.utils.loadSettings();

      jplug.utils.debug('Getting version...');
      jplug.utils.debug('[getFiles] Getting version info...');
      $.getJSON(jplug.utils.timeQuery(jplug.files.version)).done((data) => {
        jplug.utils.debug('[getFiles] Retrieved version info');
        jplug.version.major = data.version.major;
        jplug.version.minor = data.version.minor;
        jplug.version.patch = data.version.patch;
        jplug.version.notes = data.notes;

        jplug.utils.debug('[getFiles] Loaded');
        callback();
      });
    },
    timeQuery: function (url) {
      if (!(url instanceof URL))
        url = new URL(url);
      url.searchParams.set('t', Date.now());
      return url.href;
    },
    getTimeStamp: function () {
      return PlugSettings.settings.chatTimestamps === 24 ? new Date().toTimeString().split(' ')[0].slice(0, -3) : (PlugSettings.settings.chatTimestamps === 12 ? PlugTime.getChatTimestamp() : '');
    },
    skip: function () {
      if (API.getDJ().id === API.getUser().id) {
        $.post('/_/booth/skip/me');
      } else {
        API.moderateForceSkip();
      }
    },
    woot: function() {
      if (API.getDJ() && (API.getDJ().id !== API.getUser().id))
        $('woot').click();
    },
    meh: function() {
      if (API.getDJ() && (API.getDJ().id !== API.getUser().id))
        $('meh').click();
    },
    getWoots: function () {
      return API.getUsers().filter(u => u.vote === 1);
    },
    getMehs: function () {
      return API.getUsers().filter(u => u.vote === -1);
    },
    getGrabs: function () {
      return API.getUsers().filter(u => u.grab);
    },
    searchHistory: function (string) {
      return API.getHistory().filter(e => e.media.title.toLowerCase().indexOf(string.toLowerCase()) > -1);
    }
  },

  /** Chat Logs
  --------------------------------------------------*/

  __chat: {
    log: function (type, badge, title, message) {
      this.rawLog(type, badge, jplug.utils.striphtml(title), jplug.utils.striphtml(message));
    },
    logSmall: function (type, badge, message) {
      this.rawLogSmall(type, badge, jplug.utils.striphtml(message));
    },
    rawLog: function (type, badge, title, message) {
      const id = `jplug-${Date.now()}`;
      const timestamp = jplug.utils.getTimeStamp();
      // TODO: use own styling rather than rcs
      $('#chat-messages').append(`<div class="cm message jplug-log jplug-log-${type}" id="${id}"><div class="badge-box"><i class="${badge}"></i></div><div class="msg"><div class="from"><span class="jplug-chat-title">${title}</span><span class="timestamp" style="display: inline;">${timestamp}</span></div><div class="text">${message}</div></div></div>`);
      rcs.Utils.scrollChat('#chat-messages');
      rcs.__chatMessages.deleteButton(id, false);
    },
    rawLogSmall: function (type, badge, message) {
      const id = `jplug-${Date.now()}`;
      const timestamp = jplug.utils.getTimeStamp();
      $('#chat-messages').append(`<div class="cm message jplug-log sml jplug-log-${type}" id="${id}"><div class="badge-box"><i class="${badge}"></i></div><div class="msg"><div class="from"><span class="timestamp" style="display: inline;">${timestamp}</span></div><div class="text">${message}</div></div></div>`);
      rcs.Utils.scrollChat('#chat-messages');
      rcs.__chatMessages.deleteButton(id, false);
    }
  },

  /** Update Checker
  --------------------------------------------------*/

  checkUpdates: function () {
    jplug.utils.debug('[update] Checking for updates...');
    jplug._updateChecked || $.getJSON(jplug.utils.timeQuery(jplug.files.version)).done((data) => {
      const latest = `${data.version.major}.${data.version.minor}.${data.version.patch}`;
      jplug.utils.debug(`[update] Latest: v${latest}`);
      jplug.utils.debug(`[update] Local: v${jplug.version.major}.${jplug.version.minor}.${jplug.version.patch}`);
      if (data.version.major > jplug.version.major || data.version.minor > jplug.version.minor || data.version.patch > jplug.version.patch) {
        jplug.utils.debug(`[update] Found update: v${latest}`);

        const timestamp = jplug.utils.getTimeStamp();
        $('#chat-messages').append(`<div class="cm message jplug-log jplug-log-system" id="jplug-found-update"><div class="badge-box"><i class="icon icon-chat-system"></i></div><div class="msg"><div class="from"><span class="jplug-chat-title">jPlug Update</span><span class="timestamp" style="display: inline;">${timestamp}</span></div><div class="text">An update for jPlug has been found - click here to update</div><div class="text"><br><strong>Includes:</strong>${data.notes}</div></div></div>`);
        jplug._updateChecked = true;
        $('#jplug-found-update').on('click', () => {
          jplug.utils.debug('[update] Update button in chat clicked');
          $.getScript(jplug.utils.timeQuery(jplug.files.js));
          $('#jplug-found-update').off('click').remove();
        });
      } else {
        jplug.utils.debug('[update] No new updates found');
      }
    });
  },

  /** Listeners
  --------------------------------------------------*/

  listeners: {
    listeners: [ {
      hook: API.CHAT,
      cb: '__CHAT'
    }, {
      hook: API.ADVANCE,
      cb: '__ADVANCE'
    }, {
      hook: API.VOTE_UPDATE,
      cb: '__VOTE_UPDATE'
    }, {
      hook: API.USER_JOIN,
      cb: '__USER_JOIN'
    }, {
      hook: API.USER_LEAVE,
      cb: '__USER_LEAVE'
    }, {
      hook: API.GRAB_UPDATE,
      cb: '__GRAB_UPDATE'
    }, {
      hook: API.USER_SKIP,
      cb: '__SKIP'
    }, {
      hook: API.MOD_SKIP,
      cb: '__SKIP'
    }, {
      hook: API.WAIT_LIST_UPDATE,
      cb: '__WAIT_LIST_UPDATE'
    }, {
      hook: API.CHAT_COMMAND,
      cb: '__CHAT_COMMAND'
    }, {
      hook: API.SCORE_UPDATE,
      cb: '__SCORE_UPDATE'
    } ],
    __active: false,
    init: function () {
      if (!this.__active) {
        for (const listener of this.listeners) {
          API.on(listener.hook, jplug._proxy[listener.cb]);
        }
        this.__active = true;
      }
    },
    close: function () {
      if (this.__active) {
        for (const listener of this.listeners) {
          API.off(listener.hook, jplug._proxy[listener.cb]);
        }
        this.__active = false;
      }
    }
  },
  initProxy: function () {
    this._proxy = {
      __CHAT: $.proxy(this.__onChat, this),
      __ADVANCE: $.proxy(this.__onDJAdvance, this),
      __VOTE_UPDATE: $.proxy(this.__onVoteUpdate, this),
      __USER_JOIN: $.proxy(this.__onUserJoin, this),
      __USER_LEAVE: $.proxy(this.__onUserLeave, this),
      __GRAB_UPDATE: $.proxy(this.__onGrabUpdate, this),
      __SKIP: $.proxy(this.__onSkip, this),
      __WAIT_LIST_UPDATE: $.proxy(this.__onWaitListUpdate, this),
      __CHAT_COMMAND: $.proxy(this.__onChatCommand, this),
      __SCORE_UPDATE: $.proxy(this.__onScoreUpdate, this)
    };
  },

  /** Listener Callback
  --------------------------------------------------*/

  __onChat: function (evt) {
    jplug.__autoRespond(evt);
  },

  __onDJAdvance: function (evt) {},

  __onVoteUpdate: function (evt) {
    jplug.__rcsMehList();
  },

  __onUserJoin: function (evt) {},
  __onUserLeave: function (evt) {},
  __onGrabUpdate: function (evt) {},
  __onSkip: function (evt) {},
  __onWaitListUpdate: function (evt) {},

  __onChatCommand: function (string) {
    const split = string.split(' ');
    const cmd = String(split[0]).substring(1).toLowerCase();
    const args = split.slice(1);

    for (const c in jplug.commands) {
      let aliases = jplug.commands[c].cmd;
      if (!Array.isArray(aliases))
        aliases = [aliases];

      for (const c2 of aliases) {
        if (cmd === c2) {
          jplug.commands[c].fn(cmd, args);
          break;
        }
      }
    }
  },

  __onScoreUpdate: function (evt) {},

  /** Commands
  --------------------------------------------------*/

  commands: {
    // reload: /<cmd>
    reload: {
      cmd: ['jreload', 'jplugreload', 'reloadjplug'],
      fn: function (cmd, args) {
        jplug.utils.debug('[reload] Command forced reload');
        $.getScript(jplug.utils.timeQuery(jplug.files.js));
      }
    },
    // afk: /<cmd> <reason>
    afk: {
      cmd: 'afk',
      fn: function (cmd, args) {
        let reason = ':o where am i???';

        if (args.length === 0) {
          if (jplug.other.afk.enabled) {
            jplug.other.afk.enabled = false;
            jplug.__chat.logSmall('yellow', '', 'AFK: false');
            API.sendChat(jplug.settings.custom.afk.stop);
            return;
          }
        } else {
          reason = args.join(' ');
        }

        jplug.other.afk.enabled = true;
        jplug.other.afk.reason = reason;
        jplug.__chat.logSmall('yellow', '', `AFK: true (${reason})`);
        API.sendChat(jplug.settings.custom.afk.start.replace(/%%reason%%/g, reason));
      }
    },
    // gifs: /<cmd> <gif>
    gif: {
      cmd: 'gif',
      fn: function (cmd, args) {
        const join = args.join(' ');
        if (jplug.settings.custom.gif.hasOwnProperty(join)) {
          API.sendChat(jplug.settings.custom.gif[join]);
        } else {
          jplug.__chat.logSmall('red', 'icon icon-chat-system', `Unknown gif: ${join}`);
        }
      }
    },
    // memes: /<cmd> <img>
    meme: {
      cmd: 'meme',
      fn: function (cmd, args) {
        const join = args.join(' ');
        if (jplug.settings.custom.meme.hasOwnProperty(join)) {
          API.sendChat(jplug.settings.custom.meme[join]);
        } else {
          jplug.__chat.logSmall('red', 'icon icon-chat-system', `Unknown meme: ${join}`);
        }
      }
    },
    // blocked song: /<cmd> [message]
    blocked: {
      cmd: ['blocked', 'available', 'restricted'],
      fn: function (cmd, args) {
        jplug.__chat.rawLogSmall('red', 'icon icon-x-grey', `<a href="https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${API.getMedia().cid}" target="_blank">Restriction Check</a>`);
      }
    },
    // hi: /<cmd>
    hi: {
      cmd: 'hi',
      fn: function (cmd, args) {
        API.sendChat(`:roohi: ${args.join(' ')}`.trim());
      }
    }
  },

  /** Init
  --------------------------------------------------*/

  __init: function () {
    jplugLoad.start = (new Date()).getTime();

    jplug.utils.debug('[init] Loading script...');

    try {
      if (!jplug.running) {
        jplug.utils.debug('[init] Loading listeners...');
        jplug.initProxy();
        jplug.listeners.init();
        jplug.utils.debug('[init] Listeners enabled');

        jplug.utils.debug('[init] Adding UI content...');
        // TODO: add settings menu
        jplug.utils.debug('[init] UI content added');

        // override rcs deleted chat
        jplug.__deletedChat(); // TODO: stop rcs overriding when reloaded

        jplug.running = true;
        jplug.utils.debug('[init] Starting features...');
        // TODO: maybe add stuff hmm?

        jplug.utils.debug('[init] Adding chat suggestions...');
        // TODO: command suggestions

        jplug.utils.debug('[init] Starting intervals...');
        jplug._tickUpdate = setInterval(jplug.checkUpdates, 5 * 60 * 1000);

        jplug.utils.debug('[init] Loading styling...');
        $('head').append(`<link rel="stylesheet" type="text/css" id="jplug-css" href="${jplug.files.css}" />`);
        // TODO: custom user styling

        jplugLoad.end = (new Date()).getTime();
        jplug.__chat.rawLogSmall('green', 'icon icon-star-white', `Activated jPlug v${jplug.version.major}.${jplug.version.minor}.${jplug.version.patch}<br>Loaded in ${jplugLoad.end - jplugLoad.start}ms`);
      }
    } catch (err) {
      throw console.error(`[jPlug] [ERROR] ${err}`), err;
    }
  },

  /** Close
  --------------------------------------------------*/

  __close: function () {
    try {
      if (jplug.running) {
        this.listeners.close();
        clearInterval(jplug._tickUpdate);

        jplug.utils.saveSettings();
        jplug.running = false;

        $('#chat-messages').find('.jplug-deleted-message').remove();
        $('.cm.jplug-log').remove();

        $('[id^="jplug-"]').off('click').remove();

        _$context._events['chat:delete'][0].callback = function (id) {
          try {
            if (this.lastText && this.lastText.hasClass(`cid-${id}`)) {
              this.lastID = this.lastType = this.lastText = this.lastTime = void 0;
            }
            const table = this.$(`.cid-${id}`).closest('.cm');
            table.find('*').off();
            table.empty().remove();
          } catch (err) {
            console.error(err, id);
          }
        };

        $('#jplug-dev-log').remove();
        jplug.__chat.logSmall('red', 'icon icon-chat-system', 'Deactivated jPlug');
        $(window).trigger('resize');
      }
    } catch (err) {
      throw console.error(`[jPlug] [ERROR] ${err}`), err;
    }
  },

  /** General
  --------------------------------------------------*/

  __rcsMehList: function () {
    // show rcs meh list
    if ($('#meh-rs-list').size() > 0) {
      $('#meh-rs-list').html('');
      API.getUsers().forEach((u) => {
        if (u.vote === -1) {
          $('#meh-rs-list').append($(`<p id="${u.id}"></p>`).text(u.username));
        }
      });
    }
  },

  __autoRespond: function (chat) {
    chat.message = jplug.utils.htmlentities(chat.message);
    chat.message = chat.message.trim();

    // username
    const uname = API.getUser().username;
    // regex chat matches
    const reMention = new RegExp(`@${uname}`, 'gi');
    const rePet = new RegExp(`(?:@(.*?)\\s+)?\\bpets\\s+@${uname}\\b`, 'i');
    const reHug = new RegExp(`(?:\\bhugs\\s+@${uname}\\b|@${uname}.*?@.*?\\b(?:gives\\s+you\\s+a\\s+(?:big\\s+)?hug|hugs\\s+you)\\b)`, 'i');
    const reBoop = new RegExp(`(?:@(.*?)\\s+)?\\b(?:boops|pokes)\\s+@${uname}\\b`);

    // afk
    if (jplug.other.afk.enabled && reMention.test(chat.message)) {
      API.sendChat(jplug.settings.custom.afk.message.replace(/%%user%%/gi, chat.un).replace(/%%reason%%/gi, jplug.other.afk.reason));
    }
    // pet
    else if (rePet.test(chat.message)) {
      let sender = rePet.exec(chat.message);
      sender = sender.length > 1 && typeof sender[1] !== 'undefined' ? sender[1] : chat.un;
      API.sendChat(`/me purrs happily at @${sender} :nekospin:`);
    }
    // hug
    else if (reHug.test(chat.message)) {
      // API.sendChat('D-don\'t hug me, it\'s not like I like you b-baka! https://i.imgur.com/BmgG3MI.gif');
      API.sendChat('D-don\'t hug me, it\'s not like I like you b-baka! :roobaka:');
    }
    // boop
    else if (reBoop.test(chat.message)) {
      let sender = reBoop.exec(chat.message);
      sender = sender.length > 1 && typeof sender[1] !== 'undefined' ? sender[1] : chat.un;
      API.sendChat(`/me :roowhat: :roogasm: :rooshy: :roobaka: ... @${sender} baka`);
    }
  },

  __deletedChat: function () {
    _$context._events['chat:delete'][0].callback = function (id) {
      try {
        this.lastText && this.lastText.hasClass(`cid-${id}`) && (this.lastID = this.lastType = this.lastText = this.lastTime = void 0);
        const msg = this.$(`.cid-${id}`).closest('.cm');
        if ((jplug.settings.deletedChat || rcs.settings.deletedChat) && jplug.running && rcs.running) {
          if (rcs.settings.improvedChat && !rcs.settings.oldChat) {
            const contents = msg.find(`.contents.cid-${id}`);
            contents.addClass('jplug-deleted-message');
            contents.find('.rcs-small-delete').remove();
            const text = msg.find('.text'), deleted = text.find('.jplug-deleted-message');
            text.children().length === deleted.length && (msg.addClass('jplug-deleted-message'),
            text.children().removeClass('jplug-deleted-message'));
          } else {
            msg.addClass('jplug-deleted-message');
            jplug.settings.hideDeleted && (msg.addClass('text-hidden'), rcs.Utils.hideButton(id));
          }
        } else {
          if (rcs.settings.improvedChat && rcs.running && !rcs.settings.oldChat) {
            msg.find(`.contents.cid-${id}`).remove();
            const text = msg.find('.text'), deleted = text.find('.jplug-deleted-message');
            text.children().length === deleted.length && (msg.find('*').off(), msg.empty().remove());
          } else {
            msg.find('*').off();
            msg.empty().remove();
          }
        }
      } catch (err) {
        console.error(err, id);
      }
    };
  }
};
jplug.utils.checkLoad();
