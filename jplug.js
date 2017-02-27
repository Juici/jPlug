// requirejs hooks
function iterate(obj, module) {
  if (typeof obj !== 'object' || typeof module !== 'object')
    return false;
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (typeof obj[prop] === 'object') {
        if (!iterate(obj[prop], module[prop])) {
          return false;
        }
      } else {
        if ((typeof module[prop]).toLowerCase() !== obj[prop].toLowerCase()) {
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

/* globals _$context, _$chatTriggers, PlugTime, PlugSettings */
typeof _$context === 'undefined' && (_$context = getModule({ _events: { 'AlertEvent:alert': 'object' }, dispatch: 'function' }));
typeof _$chatTriggers === 'undefined' && (_$chatTriggers = getModule({ chatCommand: 'function' }));
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
    js: 'https://juici.github.io/jPlug/jplug.min.js',
    css: 'https://juici.github.io/jPlug/jplug.min.css',
    version: 'https://juici.github.io/jPlug/version.json',
    users: 'https://juici.github.io/jPlug/users.json'
  },

  running: false,
  other: {
    afk: {
      enabled: false,
      message: null
    },

    users: {}
  },

  /** Settings
  --------------------------------------------------*/

  settings: {
    mod: {
      chatLog: false,
      historyAlert: false,
      lengthAlert: false,
      songAvailability: true, // TODO: check song available
      deletedChat: true,
      deletedClearup: 2 * 60 * 1000,
      hideDeleted: false
    },
    debug: false,
    custom: {
      sounds: {
        // TODO
      },
      mentions: {
        enabled: false, // TODO: custom mention strings
        match: []
      },
      afk: {
        reason: 'afk',
        message: '/me is afk right now @${user} ( ${reason} )',
        start: '/me is now afk ( ${reason} )',
        stop: '/me is no longer afk'
      },
      autoChatDelay: 8 * 1000,
      userStyles: true,

      gif: {},
      meme: {},
      hi: [
        'roohi',
        'cirhi'
      ],
      respond: {}
    }
  },

  /** Util Methods
  --------------------------------------------------*/

  utils: {
    _sandboxDocument: null,
    htmlEntities: function (text) {
      let doc = jplug.utils._sandboxDocument;
      if (!doc || typeof doc === 'undefined' || doc === null)
        doc = jplug.utils._sandboxDocument = document.implementation.createHTMLDocument('jplug-sandbox');
      const tmp = doc.createElement('div');
      tmp.innerHTML = text;
      return tmp.textContent || tmp.text || tmp.innerText || '';
    },
    cleanHTML: function (text) {
      const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, allow = ['blockquote', 'code', 'span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'];
      text = text.split('&#8237;').join('&amp;#8237;').split('&#8238;').join('&amp;#8238;'); // remove ltr / rtl overrides
      return text.replace(tags, (a, b) => {
        return allow.indexOf(b.toLowerCase()) > -1 ? a : '';
      });
    },
    extend: function (a, b) {
      for (const i in b) {
        if (typeof a[i] === 'object' && a[i] !== null && typeof b[i] === 'object' && b[i] !== null) {
          a[i] = this.extend(a[i], b[i]);
        } else {
          a[i] = b[i];
        }
      }
      return a;
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
      jplug.utils.extend(jplug.settings, JSON.parse(localStorage.getItem('jplug-settings')) || {});
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

      jplug.utils.loadSettings();

      jplug.utils.debug('Getting version...');
      jplug.utils.debug('[getFiles] Getting version info...');
      $.getJSON(jplug.files.version, { cache: false }).done((data) => {
        jplug.utils.debug('[getFiles] Retrieved version info');
        jplug.version.major = data.version.major;
        jplug.version.minor = data.version.minor;
        jplug.version.patch = data.version.patch;
        jplug.version.notes = data.notes;

        jplug.utils.debug('[getFiles] Getting users...');
        $.getJSON(jplug.files.users, { cache: false }).done((users) => {
          jplug.utils.debug('[getFiles] Retrieved users');
          jplug.other.users = users;
          jplug.__users();

          jplug.utils.debug('[getFiles] Loaded');
          callback();
        });
      });
    },
    timeQuery: function (url) {
      if (!(url instanceof URL))
        url = new URL(url);
      url.searchParams.set('_', Date.now());
      return url.href;
    },
    getTimeStamp: function () {
      return PlugSettings.settings.chatTimestamps === 24 ? (new Date()).toTimeString().split(' ')[0].slice(0, -3) : (PlugSettings.settings.chatTimestamps === 12 ? PlugTime.getChatTimestamp() : '');
    },
    skip: function () {
      if (API.getDJ() && (API.getDJ().id !== API.getUser().id)) {
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
      jplug.__chat.rawLog(type, badge, jplug.utils.cleanHTML(title), jplug.utils.cleanHTML(message));
    },
    logSmall: function (type, badge, message) {
      jplug.__chat.rawLogSmall(type, badge, jplug.utils.cleanHTML(message));
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
    },
    queue: function (msg) {
      const queue = jplug.__chat._queue || [];
      queue.push(msg);
      jplug.__chat._queue = queue;
      jplug.__chat.pushQueue();
    },
    pushQueue: function () {
      clearTimeout(jplug.__chat._queueId);
      if (!(jplug.__chat._queue && jplug.__chat._queue.length > 0))
        return;
      const last = jplug.__chat._last || 0, now = Date.now(), diff = now - last;
      if (last === 0 || diff > jplug.settings.custom.autoChatDelay) {
        const msg = jplug.__chat._queue[0];
        jplug.__chat._queue = jplug.__chat._queue.slice(1), jplug.__chat._last = now;
        msg && (API.sendChat(msg), jplug.__chat._queue.length > 1 && jplug.__chat.pushQueue());
      } else {
        jplug.__chat._queueId = setTimeout(jplug.__chat.pushQueue, diff);
      }
    }
  },

  /** Update Checker
  --------------------------------------------------*/

  checkUpdates: function () {
    jplug.utils.debug('[update] Checking for updates...');
    jplug._updateChecked || $.getJSON(jplug.files.version, { cache: false }).done((data) => {
      const latest = `${data.version.major}.${data.version.minor}.${data.version.patch}`;
      jplug.utils.debug(`[update] Latest: v${latest}`);
      jplug.utils.debug(`[update] Local: v${jplug.version.major}.${jplug.version.minor}.${jplug.version.patch}`);
      if (data.version.major > jplug.version.major || data.version.minor > jplug.version.minor || data.version.patch > jplug.version.patch) {
        jplug.utils.debug(`[update] Found update: v${latest}`);

        const timestamp = jplug.utils.getTimeStamp();
        $('#chat-messages').append(`<div class="cm message jplug-log jplug-log-red" id="jplug-found-update"><div class="badge-box"><i class="icon icon-system-red"></i></div><div class="msg"><div class="from"><span class="jplug-chat-title">jPlug Update</span><span class="timestamp" style="display: inline;">${timestamp}</span></div><div class="text">An update for jPlug has been found - click here to update</div><div class="text"><br><strong>Includes:</strong><br>${data.notes}</div></div></div>`);
        jplug._updateChecked = true;
        $('#jplug-found-update').on('click', () => {
          jplug.utils.debug('[update] Update button in chat clicked');
          $.getScript(jplug.files.js, { cache: false });
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
    const split = string.split(/\s+/);
    const cmd = String(split[0]).substring(1).toLowerCase();
    const args = split.slice(1);

    for (const c in jplug.commands) {
      let aliases = jplug.commands[c].cmd;
      Array.isArray(aliases) || (aliases = [aliases]);
      if (aliases.indexOf(cmd) > -1) {
        jplug.commands[c].fn(cmd, args);
        break;
      }
    }
  },

  __onScoreUpdate: function (evt) {},

  /** Commands
  --------------------------------------------------*/

  commands: {
    reload: {
      cmd: ['jreload', 'jplugreload', 'reloadjplug'],
      desc: 'Reloads the script',
      usage: '/<cmd>',
      fn: function (cmd, args) {
        jplug.utils.debug('[reload] Command forced reload');
        $.getScript(jplug.files.js, { cache: false });
      }
    },

    help: {
      cmd: 'help',
      desc: 'Lists commands or information about specified command',
      usage: '/<cmd> [cmd]',
      fn: function (cmd, args) {
        if (args.length === 0) {
          const lines = [];

          for (let c in jplug.commands) {
            c = jplug.commands[c];
            let alias = c.cmd;
            Array.isArray(alias) && (alias = alias[0]);
            lines.push(`/${alias} - <em>${c.desc}</em>`);
          }

          jplug.__chat.rawLog('yellow', 'icon icon-chat-admin', 'Command Help', lines.join('<br>'));
        } else {
          const search = args.length === 1 ? args[0].toLowerCase() : 'help';
          let c;
          let a;

          for (let c2 in jplug.commands) {
            c2 = jplug.commands[c2];
            let aliases = c2.cmd;
            Array.isArray(aliases) || (aliases = [aliases]);

            if (aliases.indexOf(search) > -1) {
              c = c2;
              a = aliases;
              break;
            }
          }

          if (typeof c !== 'undefined' && c !== null && 'cmd' in c) {
            jplug.__chat.rawLog('yellow', 'icon icon-chat-admin', `Command Help: ${search}`, `Aliases: <em>${a.join(', ')}</em><br>Description: <em>${c.desc}</em><br>Usage: <em>${c.usage.replace('<cmd>', search)}</em>`);
          } else {
            jplug.__chat.log('red', 'icon icon-system-red', 'Command Help', `Unknown command: ${args[0]}`);
          }
        }
      }
    },

    blocked: {
      cmd: ['blocked', 'available', 'restricted'],
      desc: 'Links the YouTube restricted video checker to check what countries the video is unavailable in',
      usage: '/<cmd>',
      fn: function (cmd, args) {
        jplug.__chat.rawLogSmall('red', 'icon icon-x-grey', `<a href="https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${API.getMedia().cid}" target="_blank">Restriction Check</a>`);
      }
    },

    afk: {
      cmd: 'afk',
      desc: 'Go AFK with optional reason',
      usage: '/<cmd> [reason]',
      fn: function (cmd, args) {
        let reason = jplug.settings.custom.afk.reason;

        if (args.length === 0) {
          if (jplug.other.afk.enabled) {
            jplug.other.afk.enabled = false;
            jplug.__chat.logSmall('yellow', 'icon icon-user-white', 'AFK: false');
            jplug.__chat.queue(jplug.settings.custom.afk.stop);
            return;
          }
        } else {
          reason = args.join(' ');
        }

        jplug.other.afk.enabled = true;
        jplug.other.afk.reason = reason;
        jplug.__chat.logSmall('yellow', 'icon icon-user-white', `AFK: true ( ${reason} )`);
        jplug.__chat.queue(jplug.settings.custom.afk.start.replace(/%%reason%%/g, reason));
      }
    },

    clear: {
      cmd: ['clear', 'clearchat', 'cc'],
      desc: 'Clear the chat',
      usage: '/<cmd>',
      fn: function (cmd, args) {
        $('#chat-messages').html('');
        jplug.__chat.rawLogSmall('yellow', 'icon icon-x-white', '<em>Chat log cleared!</em>');
      }
    },

    // TODO: add ignore / unignore

    gif: {
      cmd: 'gif',
      desc: 'Send a gif along with optional message',
      usage: '/<cmd> <gif> [msg]',
      fn: function (cmd, args) {
        if (args.length === 0)
          return jplug.__chat.logSmall('red', 'icon icon-system-red', `Usage: ${this.usage.replace('<cmd>', cmd)}`);

        const gif = args[0].toLowerCase(), msg = args.slice(1).join(' ');
        if (jplug.settings.custom.gif.hasOwnProperty(gif)) {
          API.sendChat(`${msg} ${jplug.settings.custom.gif[gif]}`.trim());
        } else {
          jplug.__chat.logSmall('red', 'icon icon-system-red', `Unknown gif: ${msg}`);
        }
      }
    },

    meme: {
      cmd: 'meme',
      desc: 'Send a meme along with optional message',
      usage: '/<cmd> <meme> [msg]',
      fn: function (cmd, args) {
        if (args.length === 0)
          return jplug.__chat.logSmall('red', 'icon icon-system-red', `Usage: ${this.usage.replace('<cmd>', cmd)}`);

        const meme = args[0].toLowerCase(), msg = args.slice(1).join(' ');
        if (jplug.settings.custom.meme.hasOwnProperty(meme)) {
          API.sendChat(`${msg} ${jplug.settings.custom.meme[meme]}`.trim());
        } else {
          jplug.__chat.logSmall('red', 'icon icon-system-red', `Unknown meme: ${msg}`);
        }
      }
    },

    hi: {
      cmd: 'hi',
      desc: 'Send a hi emote along with optional message',
      usage: '/<cmd> [msg]',
      fn: function (cmd, args) {
        API.sendChat(`:${jplug.settings.custom.hi[Math.floor(Math.random() * jplug.settings.custom.hi.length)]}: ${args.join(' ')}`.trim());
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

        $(window).on('beforeunload.plug', () => jplug.utils.saveSettings());

        jplug.utils.debug('[init] Adding UI content...');
        // TODO: add settings menu
        jplug.utils.debug('[init] UI content added');

        jplug.running = true;
        jplug.utils.debug('[init] Starting features...');
        jplug.__deletedChat(); // TODO: stop rcs overriding when reloaded
        jplug.__command.init();

        jplug.utils.debug('[init] Adding chat suggestions...');
        // TODO: command suggestions

        jplug.utils.debug('[init] Starting intervals...');
        jplug._tickUpdate = setInterval(jplug.checkUpdates, 5 * 60 * 1000);

        jplug.utils.debug('[init] Loading styling...');
        $('head').append('<style id="jplug-anchor"></style>');
        $('#jplug-anchor').after(`<link rel="stylesheet" type="text/css" id="jplug-css" href="${jplug.utils.timeQuery(jplug.files.css)}" />`);
        // TODO: custom user styling

        jplugLoad.end = (new Date()).getTime();
        jplug.__chat.rawLogSmall('blue', 'icon icon-tick-white', `Activated jPlug v${jplug.version.major}.${jplug.version.minor}.${jplug.version.patch}<br>Loaded in ${jplugLoad.end - jplugLoad.start}ms`);
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

        $(window).off('beforeunload.plug');

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
        jplug.__chat.logSmall('red', 'icon icon-system-red', 'Deactivated jPlug');
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
    chat.message = jplug.utils.htmlEntities(chat.message);
    chat.message = chat.message.trim();

    // username
    const uname = API.getUser().username;

    // afk
    const reMention = new RegExp(`@${uname}\\b`, 'gi');
    if (jplug.other.afk.enabled && reMention.test(chat.message)) {
      jplug.__chat.queue(jplug.settings.custom.afk.message.replace(/\$\{sender\}/gi, chat.un).replace(/\$\{reason\}/gi, jplug.other.afk.reason));
    }

    // custom responders
    for (const r of jplug.settings.custom.respond) {
      if (typeof r.re === 'string' && typeof r.msg === 'string') {
        const re = new RegExp(r.re.replace(/\$\{user\}/gi, uname), 'i');

        if (re.test(chat.message)) {
          let sender = re.exec(chat.message);
          sender = sender.length > 1 && typeof sender[1] !== 'undefined' ? sender[1] : chat.un;
          jplug.__chat.queue(r.msg.replace(/\$\{sender\}/gi, sender));
        }
      }
    }
  },

  __deletedChat: function () {
    _$context._events['chat:delete'][0].callback = function (id) {
      try {
        this.lastText && this.lastText.hasClass(`cid-${id}`) && (this.lastID = this.lastType = this.lastText = this.lastTime = void 0);
        const msg = this.$(`.cid-${id}`).closest('.cm');
        if ((jplug.settings.mod.deletedChat || rcs.settings.deletedChat) && jplug.running && rcs.running) {
          if (rcs.settings.improvedChat && !rcs.settings.oldChat) {
            const contents = msg.find(`.contents.cid-${id}`);
            contents.addClass('jplug-deleted-message');
            contents.find('.rcs-small-delete').remove();
            const text = msg.find('.text'), deleted = text.find('.jplug-deleted-message');
            text.children().length === deleted.length && (msg.addClass('jplug-deleted-message'),
            text.children().removeClass('jplug-deleted-message'));
          } else {
            msg.addClass('jplug-deleted-message');
            (jplug.settings.mod.hideDeleted || rcs.settings.hideDeleted) && (msg.addClass('text-hidden'), rcs.Utils.hideButton(id));
          }

          // handle deleted chat clear up
          jplug.settings.mod.deletedClearup > 0 && setTimeout(() => { jplug.settings.mod.deletedClearup > 0 && (msg.find('*').off(), msg.empty().remove()) }, jplug.settings.mod.deletedClearup);
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
  },

  __command: {
    init: function () {
      // override plug command handling
      this.__oldFn = _$chatTriggers.chatCommand;
      _$chatTriggers.chatCommand = function (cmd) {
        return cmd.charAt(0) === '/' ? jplug.__command.handle(cmd) : false;
      }
    },
    handle: function (cmd) {
      // /em and /me are passed as chat
      if (cmd.indexOf('/em ') === 0 || cmd.indexOf('/me ') === 0)
        return false;

      if (cmd.indexOf('/sos ') === 0)
        return this.__oldFn(cmd);

      return _$context.trigger('chat:command', cmd), true;
    }
  },

  __users: function () {
    $('#jplug-users').remove();
    if (!jplug.settings.custom.userStyles)
      return;

    const css = [];
    for (const id in jplug.other.users) {
      // badge
      if ('badge' in jplug.other.users[id]) {
        const badge = jplug.utils.cleanHTML(jplug.other.users[id].badge);
        css.push(`#chat .id-${id} .badge-box .bdg, #user-rollover.id-${id} .badge-box .bdg { background-image: url(${badge}) !important; background-size: cover !important; border-radius: 6px !important }`);
        parseInt(id) === API.getUser().id && css.push(`#footer-user .badge .bdg { background-image: url(${badge}) !important; background-size: cover !important; border-radius: 6px !important }`);
      }

      // color
      if ('color' in jplug.other.users[id]) {
        const color = jplug.utils.cleanHTML(jplug.other.users[id].color);
        css.push(`#chat .id-${id} .un, #user-lists .list .id-${id} .name, #waitlist .list .user[data-uid="${id}"] .name span { color: ${color} !important }`);
      }
    }
    $('#jplug-anchor').after(`<style id="jplug-users">${css.join('\n')}</style>`);
  }
};
jplug.utils.checkLoad();
