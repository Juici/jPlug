/**
 * Adapted from plugCubed ModuleLoader.js
 */
define(['jplug/Class'], (Class) => {

    const modules = require.s.contexts._.defined;
    let ref1, ref2, ref3, cb, ev, i;
    const ModuleLoader = Class.extend({
        init(a) {
            if (typeof window.plugModules === 'undefined')
                window.plugModules = {};

            for (const id in modules) {
                if (!modules.hasOwnProperty(id)) continue;

                const m = modules[id];

                if (m) {
                    let moduleName = false;

                    if (!('requireID' in m))
                        m.requireID = id;

                    switch (false) {
                        case !m.MASTER:
                            moduleName = 'RandomUtil';
                            break;
                        case !m.ACTIVATE:
                            moduleName = 'ActivateEvent';
                            break;
                        case m._name !== 'MediaGrabEvent':
                            moduleName = 'MediaGrabEvent';
                            break;
                        case m._name !== 'AlertEvent':
                            moduleName = 'AlertEvent';
                            break;
                        case !m.deserializeMedia:
                            moduleName = 'auxiliaries';
                            break;
                        case !m.AUDIENCE:
                            moduleName = 'Avatar';
                            break;
                        case !m.getAvatarUrl:
                            moduleName = 'avatarAuxiliaries';
                            break;
                        case !m.Events:
                            moduleName = 'backbone';
                            break;
                        case !m.mutes:
                            moduleName = 'chatAuxiliaries';
                            break;
                        case !m.updateElapsedBind:
                            moduleName = 'currentMedia';
                            break;
                        case !m.settings:
                            moduleName = 'database';
                            break;
                        case !m.emojiMap:
                            moduleName = 'emoji';
                            break;
                        case !m.mapEvent:
                            moduleName = 'eventMap';
                            break;
                        case !m.getSize:
                            moduleName = 'Layout';
                            break;
                        case !m.compress:
                            moduleName = 'LZString';
                            break;
                        case !m._read:
                            moduleName = 'playlistCache';
                            break;
                        case !m.activeMedia:
                            moduleName = 'playlists';
                            break;
                        case !m.scThumbnail:
                            moduleName = 'plugUrls';
                            break;
                        case m.className !== 'pop-menu':
                            moduleName = 'popMenu';
                            break;
                        case m._name !== 'RoomEvent':
                            moduleName = 'RoomEvent';
                            break;
                        case !(m.comparator && m.comparator === 'username'):
                            moduleName = 'ignoreCollection';
                            break;
                        case !(m.comparator && m.exists):
                            moduleName = 'roomHistory';
                            break;
                        case !m.onVideoResize:
                            moduleName = 'roomLoader';
                            break;
                        case !m.ytSearch:
                            moduleName = 'searchAux';
                            break;
                        case !m._search:
                            moduleName = 'searchManager';
                            break;
                        case m.SHOW !== 'ShowDialogEvent:show':
                            moduleName = 'ShowDialogEvent';
                            break;
                        case !m.ack:
                            moduleName = 'socketEvents';
                            break;
                        case !m.sc:
                            moduleName = 'soundcloud';
                            break;
                        case !m.identify:
                            moduleName = 'tracker';
                            break;
                        case !m.canModChat:
                            moduleName = 'CurrentUser';
                            break;
                        case !m.onRole:
                            moduleName = 'users';
                            break;
                        case !m.PREVIEW:
                            moduleName = 'PreviewEvent';
                            break;
                        case !('_window' in m):
                            moduleName = 'PopoutView';
                            break;
                        default:
                            switch (m.id) {
                                case 'playlist-menu':
                                    moduleName = 'playlistMenu';
                                    break;
                                case 'user-lists':
                                    moduleName = 'userList';
                                    break;
                                case 'user-rollover':
                                    moduleName = 'userRollover';
                                    break;
                                case 'audience':
                                    moduleName = 'audienceRenderer';
                                    break;
                                default:
                                    switch (false) {
                                        case !((ref1 = m._events) !== null && typeof ref1 !== 'undefined' && ref1['chat:receive']):
                                            moduleName = 'context';
                                            break;
                                        case !m.attributes:
                                            switch (false) {
                                                case !('shouldCycle' in m.attributes):
                                                    moduleName = 'booth';
                                                    break;
                                                case !('hostID' in m.attributes):
                                                    moduleName = 'room';
                                                    break;
                                                case !('grabbers' in m.attributes):
                                                    moduleName = 'votes';
                                                    break;
                                                default:
                                                    break;
                                            }
                                            break;
                                        case !m.prototype:
                                            switch (false) {
                                                case m.prototype.id !== 'user-inventory':
                                                    moduleName = 'userInventory';
                                                    break;
                                                case m.prototype.className !== 'friends':
                                                    moduleName = 'FriendsList';
                                                    break;
                                                case !(m.prototype.className === 'avatars' && m.prototype.eventName):
                                                    moduleName = 'InventoryAvatarPage';
                                                    break;
                                                case !(m.prototype.template === require('hbs!templates/user/inventory/TabMenu')):
                                                    moduleName = 'TabMenu';
                                                    break;
                                                case !(m.prototype.className === 'list room'):
                                                    moduleName = 'RoomUsersListView';
                                                    break;
                                                case !(m.prototype.className === 'cell' && m.prototype.getBlinkFrame):
                                                    moduleName = 'AvatarCell';
                                                    break;
                                                case !m.prototype.scrollToBottom:
                                                    moduleName = 'PopoutChat';
                                                    break;
                                                case !m.prototype.onFromClick:
                                                    moduleName = 'Chat';
                                                    break;
                                                case m.prototype.id !== 'dialog-alert':
                                                    moduleName = 'DialogAlert';
                                                    break;
                                                case !(m.prototype.defaults && 'title' in m.prototype.defaults && 'duration' in m.prototype.defaults):
                                                    moduleName = 'Media';
                                                    break;
                                                case !m.prototype.onPlaylistVisible:
                                                    moduleName = 'MediaPanel';
                                                    break;
                                                case m.prototype.id !== 'playback':
                                                    moduleName = 'Playback';
                                                    break;
                                                case m.prototype.id !== 'volume':
                                                    moduleName = 'Volume';
                                                    break;
                                                case m.prototype.id !== 'dialog-playlist-create':
                                                    moduleName = 'PlaylistCreateDialog';
                                                    break;
                                                case m.prototype.listClass !== 'playlist-media':
                                                    moduleName = 'PlaylistItemList';
                                                    break;
                                                case !m.prototype.onItemsChange:
                                                    moduleName = 'PlaylistListRow';
                                                    break;
                                                case !m.prototype.hasOwnProperty('permissionAlert'):
                                                    moduleName = 'PlugAjax';
                                                    break;
                                                case !m.prototype.vote:
                                                    moduleName = 'RoomUserRow';
                                                    break;
                                                case !m.prototype.onQueryUpdate:
                                                    moduleName = 'SearchHeader';
                                                    break;
                                                case m.prototype.listClass !== 'search':
                                                    moduleName = 'SearchList';
                                                    break;
                                                case !(m.prototype.id === 'chat-suggestion' && m.__super__.id !== 'chat-suggestion'):
                                                    moduleName = 'SuggestionView';
                                                    break;
                                                case !m.prototype.onAvatar:
                                                    moduleName = 'WaitlistRow';
                                                    break;
                                                case !m.prototype.loadRelated:
                                                    moduleName = 'YtSearchService';
                                                    break;
                                                default:
                                                    break;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                            }
                    }
                    if (moduleName) {
                        if (!window.jplug && typeof window.plugModules !== 'undefined' && window.plugModules !== null && moduleName in window.plugModules && window.plugModules[moduleName] !== null)
                            console.warn(`[jPlug] [ModuleLoader] found multiple matches for '${moduleName}'`);

                        window.plugModules[moduleName] = m;
                    }
                }
            }
            window.plugModules.Lang = require('lang/Lang');
            for (i = 0; i < (ref2 = window.plugModules.room._events['change:name'] || window.plugModules.context._events['show:room'] || window.plugModules.Layout._events.resize || []).length; i++) {
                cb = ref2[i];
                if (cb.ctx.room) {
                    window.plugModules.app = cb.ctx;
                    window.plugModules.friendsList = window.plugModules.app.room.friends;
                    window.plugModules.search = window.plugModules.app.footer.playlist.playlist.search;
                    window.plugModules.pl = window.plugModules.app.footer.playlist.playlist.media;
                    break;
                }
            }
            if (window.plugModules.app && !(window.plugModules.chat = window.plugModules.app.room.chat) && window.plugModules.context)
                for (i = 0; i < (ref3 = window.plugModules.context._events['chat:receive'] || []).length; i++) {
                    ev = ref3[i];

                    if (ref3.context && ref3.context.cid) {
                        window.plugModules.chat = ev.context;
                        break;
                    }
                }

        }

    });

    return new ModuleLoader();
});
