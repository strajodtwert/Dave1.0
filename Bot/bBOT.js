/*
  Copyright (c) 2014-2015 by BalkanParty
 
  Permission to use this software for any purpose without fee is hereby granted, provided
  that the above copyright notice and this permission notice appear in all copies.

   Permission to copy and/or edit this software or parts of it for any purpose is permitted,
   provided that the following points are followed.
 - The above copyright notice and this permission notice appear in all copies
 - Within two (2) days after modification is proven working, any modifications are send back
   to the original authors to be inspected with the goal of inclusion in the official software
 - Any edited version are only test versions and not permitted to be run as a final product
 - Any edited version aren't to be distributed
 - Any edited version have the prerelease version set to something that can be distinguished
   from a version used in the original software

*/

// THIS IS EDITED VERSION OF BASIC BOT - Translation, Custom Commands, Edited Commands

var password = "balkansqueebot"

var x = prompt("Unesite sifru za pokretanje SqueeBOT!"," ")

if (x.toLowerCase() == password) {
alert("Prijava uspijesna. Pokrecem SqueeBOT...");

API.chatLog("[ Povezivanje... ] LAST UPDATED: 25.06.2015", true);

(function () {

   /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem("bBotRoom"));
        window.location = 'https://plug.dj' + room.name;
    }; */  

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(bBot.room.autorouletteInterval);
        clearInterval(bBot.room.afkInterval);
        bBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("bBotsettings", JSON.stringify(bBot.settings));
        localStorage.setItem("bBotRoom", JSON.stringify(bBot.room));
        var bBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: bBot.version
        };
        localStorage.setItem("bBotStorageInfo", JSON.stringify(bBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/MrAjdin/BalkanBot/master/Lang/langIndex.json", function (json) {
            var link = bBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[bBot.settings.language.toLowerCase()];
                if (bBot.settings.chatLink !== bBot.chatLink) {
                    link = bBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = bBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        bBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(bBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        bBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("bBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                bBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("bBotStorageInfo");
        if (info === null) API.chatLog(bBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("bBotsettings"));
            var room = JSON.parse(localStorage.getItem("bBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(bBot.chat.retrievingdata);
                for (var prop in settings) {
                    bBot.settings[prop] = settings[prop];
                }
                bBot.room.users = room.users;
                bBot.room.afkList = room.afkList;
                bBot.room.historyList = room.historyList;
                bBot.room.mutedUsers = room.mutedUsers;
                bBot.room.autoskip = room.autoskip;
                bBot.room.roomstats = room.roomstats;
                bBot.room.messages = room.messages;
                bBot.room.queue = room.queue;
                bBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(bBot.chat.datarestored);
            }
        }
     var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@bBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        bBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };


    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
      return this.substring(0, str.length) === str;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var decodeEntities = function (s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = "BalkanParty";
    var botCreatorIDs = ["4756576"];

    var bBot = {
        version: "v2.3.2",
        status: false,
        name: "SqueeBOT",
        loggedInID: "23625731",
        scriptLink: "https://www.balkan-party.cf/files/theme/bot/SqueeBOTOrigin.js",
        cmdLink: "http://www.balkan-party.cf/bbot.html",
        chatLink: "https://rawgit.com/MrAjdin/BalkanBot/master/Lang/cro.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "SqueeBOT",
            language: "croatian",
            chatLink: "https://rawgit.com/MrAjdin/BalkanBot/master/Lang/cro.json",
            roomLock: true, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: true, // true or false
            cmdDeletion: true,
            maximumAfk: 90,
            afkRemoval: false,
            maximumDc: 20,
            bouncerPlus: false,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: true,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: true,
            voteSkipLimit: 8,
            historySkip: true,
            timeGuard: true,
            maximumSongLength: 7,
            autoroulette: false,
            commandCooldown: 6,
            usercommandsEnabled: true,
            lockskipPosition: 3,
            lockskipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            ball: [
            "Znakovi mi govore, da.",
            "Da.",
            "Pokusaj ponovo.",
            "Bez sumnje.",
            "Moji izvori mi govore, da.",
            "Kako ja vidim, da.",
            "Vjerovatno.",
            "Fokusiraj se i pitaj.",
            "Ne bas.",
            "Odlucno da,",
            "Bolje da ti ne kazem.",
            "Hmm, da razmislim.",
            "Da, definitivno.",
            "To je sigurno.",
            "Ne mogu to predvidit.",
            "100% sam siguran.",
            "Pitaj ponovo kasnije.",
            "Moj odgovor je ne.",
            "Sto da ne.",
            "Ne racunaj na to.",
            "Da, u dogledno vrijeme.",
            "Ne, ne.",
            "Definitivno ne.",
            "Morat ces pricekati.",
            "Imam sumnje u to.",
            "Da, da.",
            "Meni izgleda super.",
            "Ko ce ti znati.",
            "Izgleda dobro. da.",
            "Vjerovatno.",
            "Zezas me?",
            "Nemoj se kladiti na to.",
            "Mozes zaboravit na to.",
            "moze da bude a i ne mora."
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 10,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: "http://www.balkan-party.cf/blacklist.html",
            rulesLink: "http://www.balkan-party.cf/rules.html",
            themeLink: null,
            fbLink: "https://www.facebook.com/groups/bestparty19/",
            youtubeLink: "http://bit.ly/1JCermI",
            website: "http://www.balkan-party.cf/",
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: "!",
            blacklists: {
                OP: "https://rawgit.com/MrAjdin/BalkanBot/master/blackList/OP.json"
            }
        },
        room: {
            name: null,
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autorouletteInterval: null,
            autorouletteFunc: function () {
                if (bBot.status && bBot.settings.autoroulette) {
                    API.sendChat('!roulette');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    bBot.room.roulette.rouletteStatus = true;
                    bBot.room.roulette.countdown = setTimeout(function () {
                        bBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(bBot.chat.isopen);
                },
                endRoulette: function () {
                    bBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * bBot.room.roulette.participants.length);
                    var winner = bBot.room.roulette.participants[ind];
                    bBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = bBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(bBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        bBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = bBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < bBot.room.users.length; i++) {
                    if (bBot.room.users[i].id === id) {
                        return bBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < bBot.room.users.length; i++) {
                    var match = bBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return bBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = bBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = bBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < bBot.room.queue.id.length; i++) {
                            if (bBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            bBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(bBot.chat.alreadyadding, {position: bBot.room.queue.position[alreadyQueued]}));
                        }
                        bBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            bBot.room.queue.id.unshift(id);
                            bBot.room.queue.position.unshift(pos);
                        }
                        else {
                            bBot.room.queue.id.push(id);
                            bBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(bBot.chat.adding, {name: name, position: bBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = bBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return bBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(bBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return bBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (bBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = bBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(bBot.chat.toolongago, {name: bBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = bBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = bBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(bBot.chat.valid, {name: bBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                bBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!bBot.roomUtilities.booth.locked);
                    bBot.roomUtilities.booth.locked = false;
                    if (bBot.settings.lockGuard) {
                        bBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(bBot.roomUtilities.booth.locked);
                        }, bBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(bBot.roomUtilities.booth.locked);
                    clearTimeout(bBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!bBot.status || !bBot.settings.afkRemoval) return void (0);
                var rank = bBot.roomUtilities.rankToNumber(bBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, bBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = bBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = bBot.userUtilities.getUser(user);
                            if (rank !== null && bBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = bBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = bBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > bBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(bBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(bBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            bBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(bBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: bBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (bBot.settings.cycleGuard) {
                        bBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, bBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(bBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (bBot.settings.motdEnabled) interval = bBot.settings.motdInterval;
                else interval = bBot.settings.messageInterval;
                if ((bBot.room.roomstats.songCount % interval) === 0 && bBot.status) {
                    var msg;
                    if (bBot.settings.motdEnabled) {
                        msg = bBot.settings.motd;
                    }
                    else {
                        if (bBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = bBot.room.roomstats.songCount % bBot.settings.intervalMessages.length;
                        msg = bBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in bBot.settings.blacklists) {
                    bBot.room.blacklists[bl] = [];
                    if (typeof bBot.settings.blacklists[bl] === 'function') {
                        bBot.room.blacklists[bl] = bBot.settings.blacklists();
                    }
                    else if (typeof bBot.settings.blacklists[bl] === 'string') {
                        if (bBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(bBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    bBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(bBot.room.newBlacklisted);
                }
                else {
                    console.log(bBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < bBot.room.newBlacklisted.length; i++) {
                    var track = bBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message); 
            chat.message = chat.message.trim();
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === chat.uid) {
                    bBot.userUtilities.setLastActivity(bBot.room.users[i]);
                    if (bBot.room.users[i].username !== chat.un) {
                        bBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (bBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!bBot.chatUtilities.commandCheck(chat))
                bBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                bBot.room.users[index].inRoom = true;
                var u = bBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                bBot.room.users.push(new bBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < bBot.room.users.length; j++) {
                if (bBot.userUtilities.getUser(bBot.room.users[j]).id === user.id) {
                    bBot.userUtilities.setLastActivity(bBot.room.users[j]);
                    bBot.room.users[j].jointime = Date.now();
                }

            }
            if (bBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(bBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(bBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            var previousDJ = API.getHistory()[1].user.id;
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === user.id) {
                    bBot.userUtilities.updateDC(bBot.room.users[i]);
                    bBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id || previousDJ == user.id){
                        var user = bBot.userUtilities.lookupUser(bBot.room.users[i].id);
                        bBot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        bBot.room.users[i].votes.woot++;
                    }
                    else {
                        bBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (bBot.settings.voteSkip) {
                if ((mehs - woots) >= (bBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(bBot.chat.voteskipexceededlimit, {name: chat.un, limit: bBot.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === obj.user.id) {
                    bBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click();
            var user = bBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < bBot.room.users.length; i++){
                if(bBot.room.users[i].id === user.id){
                    bBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (bBot.settings.songstats) {
                if (typeof bBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(bBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            bBot.room.roomstats.totalWoots += lastplay.score.positive;
            bBot.room.roomstats.totalMehs += lastplay.score.negative;
            bBot.room.roomstats.totalCurates += lastplay.score.grabs;
            bBot.room.roomstats.songCount++;
            bBot.roomUtilities.intervalMessage();
            bBot.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in bBot.room.blacklists) {
                if (bBot.room.blacklists[bl].indexOf(mid) > -1) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(bBot.chat.isblacklisted, {name: name, blacklist: bl}));
                    return API.moderateForceSkip();
                }
            }

            clearTimeout(historySkip);
            if (bBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            API.sendChat(subChat(bBot.chat.songknown, {name: name}));
                            API.moderateForceSkip();
                            bBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                        }
                    }
                    if (!alreadyPlayed) {
                        bBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            var newMedia = obj.media;
            if (bBot.settings.timeGuard && newMedia.duration > bBot.settings.maximumSongLength * 60 && !bBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(bBot.chat.timelimit, {name: name, maxlength: bBot.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(bBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(bBot.room.autoskipTimer);
            if (bBot.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                bBot.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (bBot.room.queue.id.length > 0 && bBot.room.queueable) {
                    bBot.room.queueable = false;
                    setTimeout(function () {
                        bBot.room.queueable = true;
                    }, 500);
                    bBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = bBot.room.queue.id.splice(0, 1)[0];
                            pos = bBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    bBot.room.queueing--;
                                    if (bBot.room.queue.id.length === 0) setTimeout(function () {
                                        bBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + bBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = bBot.userUtilities.lookupUser(users[i].id);
                bBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!bBot.settings.filterChat) return false;
            if (bBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(bBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(bBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < bBot.chatUtilities.spam.length; j++) {
                if (msg === bBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(bBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = bBot.userUtilities.getPermission(chat.uid);
                var user = bBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < bBot.room.mutedUsers.length; i++) {
                    if (bBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (bBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (bBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(bBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
    if(msg.indexOf("Dobrodosao/la") !== -1){                
                  setTimeout(function (id) {
                 API.moderateDeleteChat(id);
                }, 60 * 1000, chat.cid);
              }
        if(msg.indexOf("cao bote") !== -1 || msg.indexOf("bote cao") !== -1 || msg.indexOf("hai") !== -1 || msg.indexOf("pozz              bote") !== -1 || msg.indexOf("doing good bot?") !== -1 || msg.indexOf("bot doing good?") !== -1 || msg.indexOf("hows it going            bot") !== -1 || msg.indexOf("bot how is it going") !== -1 || msg.indexOf("how you doing bot") !== -1 || msg.indexOf("bot how you doing") !== -1){                
                  var HRUMsg = ["Pozz","hello","cao, cao"];
                 API.sendChat("@" + chat.un + " " + HRUMsg[Math.floor(Math.random() * HRUMsg.length)]);
                }
                if(msg.indexOf("hvala bote") !== -1 || msg.indexOf("hvala") !== -1 || msg.indexOf("bote hvala") !== -1 || msg.indexOf("zahvaljujem bote") !== -1){                
                  var TYMsg = ["Nema na cemu","Np  :P","Sve za tebe  <3"];
                 API.sendChat("@" + chat.un + " " + TYMsg[Math.floor(Math.random() * TYMsg.length)]);
                }
                if(msg.indexOf("volim te bote") !== -1 || msg.indexOf("ljubav moja ") !== -1 || msg.indexOf("bote volim te") !== -1 || msg.indexOf("bote srce moje") !== -1 || msg.indexOf("bote moj") !== -1 || msg.indexOf("bot majljepsi") !== -1){                
                  var LOVEMsg = ["Volim i ja tebe <3","Najvisee","Ja tebe ne, PRC","Voli tebe tvoj bot :*"];
                 API.sendChat("@" + chat.un + " " + LOVEMsg[Math.floor(Math.random() * LOVEMsg.length)]);
                }
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(bBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = bBot.chat.roulettejoin;
                var rlLeaveChat = bBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === bBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = bBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !bBot.room.usercommand) return void (0);
                    if (!bBot.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && bBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = bBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in bBot.commands) {
                    var cmdCall = bBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (bBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            bBot.commands[comm].functionality(chat, bBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    bBot.room.usercommand = false;
                    setTimeout(function () {
                        bBot.room.usercommand = true;
                    }, bBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                if (bBot.settings.cmdDeletion) {
                    API.moderateDeleteChat(chat.cid);
                    }
                    bBot.room.allcommand = false;
                    setTimeout(function () {
                        bBot.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = bBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < bBot.room.users.length; j++) {
                        if (bBot.userUtilities.getUser(bBot.room.users[j]).id === chat.uid) {
                            bBot.userUtilities.setLastActivity(bBot.room.users[j]);
                        }

                    }
                }
                bBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this)

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (bBot.userUtilities.getPermission(u) < 2) return API.chatLog(bBot.chat.greyuser);
            if (bBot.userUtilities.getPermission(u) === 2) API.chatLog(bBot.chat.bouncer);
            bBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };
  
            bBot.room.name = window.location.pathname;
            var Check;

            console.log(bBot.room.name);

            var detect = function(){
                if(bBot.room.name != window.location.pathname){
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    bBot.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                    if (bBot.settings.roomLock){
                        window.location = 'https://plug.dj' + bBot.room.name;
                    }
                    else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function(){ detect() }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = bBot;
            bBot.roomUtilities.updateBlacklists();
            setInterval(bBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            bBot.getNewBlacklistedSongs = bBot.roomUtilities.exportNewBlacklistedSongs;
            bBot.logNewBlacklistedSongs = bBot.roomUtilities.logNewBlacklistedSongs;
            if (bBot.room.roomstats.launchTime === null) {
                bBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < bBot.room.users.length; j++) {
                bBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < bBot.room.users.length; j++) {
                    if (bBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    bBot.room.users[ind].inRoom = true;
                }
                else {
                    bBot.room.users.push(new bBot.User(userlist[i].id, userlist[i].username));
                    ind = bBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(bBot.room.users[ind].id) + 1;
                bBot.userUtilities.updatePosition(bBot.room.users[ind], wlIndex);
            }
            bBot.room.afkInterval = setInterval(function () {
                bBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            bBot.room.autorouletteInterval = setInterval(function () {
                bBot.room.autorouletteFunc();
            }, 120 * 60 * 1000);
            bBot.loggedInID = API.getUser().id;
            bBot.status = true;
            API.sendChat('/cap ' + bBot.settings.startupCap);
            API.setVolume(bBot.settings.startupVolume);
            $("#woot").click();
            if (bBot.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog('Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + bBot.settings.startupCap);
            API.chatLog('Volume set to ' + bBot.settings.startupVolume);
            loadChat(API.sendChat(subChat(bBot.chat.online, {botname: bBot.settings.botName, version: bBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = bBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (bBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !bBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/
     /**
     pickthenumberCommand: {
                command: 'pickthenumber',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.gameon, {name: chat.un}));
                    }
                }
            },
          **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < bBot.room.users.length; i++) {
                            userTime = bBot.userUtilities.getLastActivity(bBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(bBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (bBot.room.roomevent) {
                                    bBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            bBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(bBot.chat.maximumafktimeset, {name: chat.un, time: bBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(bBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.afkRemoval) {
                            bBot.settings.afkRemoval = !bBot.settings.afkRemoval;
                            clearInterval(bBot.room.afkInterval);
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.afkremoval}));
                        }
                        else {
                            bBot.settings.afkRemoval = !bBot.settings.afkRemoval;
                            bBot.room.afkInterval = setInterval(function () {
                                bBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        bBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(bBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = bBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = bBot.roomUtilities.msToStr(inactivity);
                        API.sendChat(subChat(bBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                    }
                }
            },
            
            autorouletteCommand: {
                command: 'aroulette',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.autoroulette) {
                            bBot.settings.autoroulette = !bBot.settings.autoroulette;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.autoroulette}));
                        }
                        else {
                            bBot.settings.autoroulette = !bBot.settings.autoroulette;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.autoroulette}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.room.autoskip) {
                            bBot.room.autoskip = !bBot.room.autoskip;
                            clearTimeout(bBot.room.autoskipTimer);
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.autoskip}));
                        }
                        else {
                            bBot.room.autoskip = !bBot.room.autoskip;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.brandambassador);
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof bBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(bBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            bBot.room.newBlacklisted.push(track);
                            bBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(bBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof bBot.room.newBlacklistedSongFunction === 'function') {
                                bBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(bBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (bBot.settings.bouncerPlus) {
                            bBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!bBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = bBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    bBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(bBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.currentbotname, {botname: bBot.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            bBot.settings.botName = argument;
                            API.sendChat(subChat(bBot.chat.botnameset, {botName: bBot.settings.botName}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(bBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.commandslink, {botname: bBot.settings.botName, link: bBot.cmdLink}));
                    }
                }
            },

            cmddeletionCommand: {
                command: ['cmddeletion', 'cmddel'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.cmdDeletion) {
                            bBot.settings.cmdDeletion = !bBot.settings.cmdDeletion;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.cmddeletion}));
                        }
                        else {
                            bBot.settings.cmdDeletion = !bBot.settings.cmdDeletion;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.cmddeletion}));
                        }
                    }
                }
            },
 
            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
        cookies:['ti je dao kolacic sa cokoladnim mrvicama!',
                    'ti je dao ovseni kolacic!!',
                    'ti je dao obican, suv i star kolacic. Bio je zadnji u kesici. Odvratno.',
                    'ti je dao šecerni kolaeia. Šta, nema glazure ni mrvica?? 0/10 would not touch.',
                    'ti je dao kolacic sa cokoladnim mrvicama. cekaj, ovo su suve groždice.. Fuj!',
                    'ti je dao ogromni kolacic. Bockanjem daje više kolacica. cudno.',
                    'ti je dao kolac sudbine. Piše "Zašto ne radiš na projektima?"',
                    'ti je dao kolac sudbine. Piše "Daj nekome bitnom kompliment"',
                    'ti je dao kolac sudbine. Piše "Rizikuj!"',
                    'ti je dao kolac sudbine. Piše "Iza?i napolje."',
                    'ti je dao kolac sudbine. Piše "Ne zaboravi da jedeš povrae!"',
                    'ti je dao kolac sudbine. Piše "Do you even lift?"',
                    'ti je dao kolac sudbine. Piše "m808 pls"',
                    'ti je dao kolac sudbine. Piše "Ako mrdaš kukovima osvojiceš sve dame."',
                    'ti je dao kolac sudbine. Piše "Volim te."',
                    'ti je dao zlatni kolacic. Ne možeš da ga pojedeš zato što je od zlata. Do?avola.',
                    'ti je dao Oreo kolacic i cašu mlijeka!',
                    'ti je dao kolacic koji je pokisao, bu?av je.',
                    'ti pece svježe kolacice, mirišu izvrsno.'
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        bBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.cycleGuard) {
                            bBot.settings.cycleGuard = !bBot.settings.cycleGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.cycleguard}));
                        }
                        else {
                            bBot.settings.cycleGuard = !bBot.settings.cycleGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            bBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(bBot.chat.cycleguardtime, {name: chat.un, time: bBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.voteskiplimit, {name: chat.un, limit: bBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!bBot.settings.voteSkip) bBot.settings.voteSkip = !bBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(bBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            bBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(bBot.chat.voteskipsetlimit, {name: chat.un, limit: bBot.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i){
                            if (users[i].username == name){
                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;
                                if (rawlang == "en"){
                                    var language = "English";
                                } else if (rawlang == "bg"){
                                    var language = "Bulgarian";
                                } else if (rawlang == "cs"){
                                    var language = "Czech";
                                } else if (rawlang == "fi"){
                                    var language = "Finnish"
                                } else if (rawlang == "fr"){
                                    var language = "French"
                                } else if (rawlang == "pt"){
                                    var language = "Portuguese"
                                } else if (rawlang == "zh"){
                                    var language = "Chinese"
                                } else if (rawlang == "sk"){
                                    var language = "Slovak"
                                } else if (rawlang == "nl"){
                                    var language = "Dutch"
                                } else if (rawlang == "ms"){
                                    var language = "Malay"
                                }
                                var rawrank = API.getUser(id).role;
                                if (rawrank == "0"){
                                    var rank = "User";
                                } else if (rawrank == "1"){
                                    var rank = "Resident DJ";
                                } else if (rawrank == "2"){
                                    var rank = "Bouncer";
                                } else if (rawrank == "3"){
                                    var rank = "Manager"
                                } else if (rawrank == "4"){
                                    var rank = "Co-Host"
                                } else if (rawrank == "5"){
                                    var rank = "Host"
                                } else if (rawrank == "7"){
                                    var rank = "Brand Ambassador"
                                } else if (rawrank == "10"){
                                    var rank = "Admin"
                                }
                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = "https://plug.dj/@/" + slug;
                                } else {
                                    var profile = "~";
                                }

                                API.sendChat(subChat(bBot.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, joined: joined, rank: rank}));
                            }
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.voteSkip) {
                            bBot.settings.voteSkip = !bBot.settings.voteSkip;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.voteskip}));
                        }
                        else {
                            bBot.settings.motdEnabled = !bBot.settings.voteSkip;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.voteskip}));
                        }
                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = bBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(bBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = bBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        for (var i = 0; i < chats.length; i++) {
                            var n = chats[i].textContent;
                            if (name.trim() === n.trim()) {
                                var cid = $(chats[i]).parent()[0].getAttribute('data-cid');
                                API.moderateDeleteChat(cid);
                            }
                        }
                        API.sendChat(subChat(bBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(bBot.chat.emojilist, {link: link}));
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = bBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(bBot.chat.youaredj, {name: name}));
                        if (pos < 0) return API.sendChat(subChat(bBot.chat.notinwaitlist, {name: name}));
                        if (pos == 0) return API.sendChat(subChat(bBot.chat.youarenext, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = bBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(bBot.chat.eta, {name: name, time: estimateString, position: realpos}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.fbLink === "string")
                            API.sendChat(subChat(bBot.chat.facebook, {name: chat.un, link: bBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.filterChat) {
                            bBot.settings.filterChat = !bBot.settings.filterChat;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.chatfilter}));
                        }
                        else {
                            bBot.settings.filterChat = !bBot.settings.filterChat;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.chatfilter}));
                        }
                    }
                }
            },

            subscribeCommand: {
                command: ['subscribe'],
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.subscribe, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.logout, {name: chat.un, botname: bBot.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },
            
            ballCommand: {
                command: '8ball',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var crowd = API.getUsers();
                            var msg = chat.message;
                            var argument = msg.substring(cmd.length + 1);
                            var randomUser = Math.floor(Math.random() * crowd.length);
                            var randomBall = Math.floor(Math.random() * bBot.settings.ball.length);
                            var randomSentence = Math.floor(Math.random() * 1);
                            API.sendChat(subChat(bBot.chat.ball, {name: chat.un, botname: bBot.settings.botName, question: argument, response: bBot.settings.ball[randomBall]}));
                     }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(bBot.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(bBot.chat.notghosting, {name1: chat.un, name2: name}));     
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", 
                                    { 
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(bBot.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(bBot.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://api.giphy.com/v1/gifs/random?", 
                                    { 
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(bBot.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(bBot.chat.invalidgifrandom, {name: chat.un}));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "http://www.balkan-party.cf/tutorijali.html";
                        API.sendChat(subChat(bBot.chat.starterhelp, {name: chat.un, link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.historySkip) {
                            bBot.settings.historySkip = !bBot.settings.historySkip;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.historyskip}));
                        }
                        else {
                            bBot.settings.historySkip = !bBot.settings.historySkip;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.historyskip}));
                        }
                    }
                }
            },
            
            rouletteinfoCommand: {
                command: 'rouletteinfo',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.rouletteinfo, {name: chat.un}));
                    }
                }
            },
            
            mediaidCommand: {
                command: 'mediaid',
                rank: 'residentdj',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                    	API.sendChat(API.getMedia().format+":"+API.getMedia().cid, true);
                    }
                }
            },
            
            vdownloadCommand: {
                command: 'vdownload',
                rank: 'residentdj',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                    	var media = API.getMedia();
                        var linkToSong = "http://www.sfrom.net/https://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(bBot.chat.vdownload, {name: chat.un, link: linkToSong}));
                    }
                }
            },
            
            downloadCommand: {
                command: 'download',
                rank: 'residentdj',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                    	var media = API.getMedia();
                        var linkToSong = "http://www.video2mp3.net/loading.php?url=http://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(bBot.chat.download, {name: chat.un, link: linkToSong}));
                    }
                }
            },
            
            roomhelpCommand: {
                command: 'roomhelp',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                    	API.sendChat(subChat(bBot.chat.roomhelp, {name: chat.un}));
                    }
                }
            },
             
            eldoxCommand: {
command: 'eldox',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.eldox, {name: chat.un}));
}
}
},
stumblrCommand: {
command: 'stumblr',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
var link = "http://name-is-already-taken.tumblr.com/";
API.sendChat(subChat(bBot.chat.stumblr, {name: chat.un, link: link}));
}
}
},
askCommand: {
command: 'ask',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
var link = "http://ask.fm/BalkanParty12";
API.sendChat(subChat(bBot.chat.ask, {name: chat.un, link: link}));
}
}
},
tacaCommand: {
command: 'taca',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.taca, {name: chat.un}));
}
}
},
huligankaCommand: {
command: 'huliganka',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.huliganka, {name: chat.un}));
}
}
},
vlajkoCommand: {
command: 'vlajko',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.vlajko, {name: chat.un}));
}
}
},
masickaCommand: {
command: 'masicka',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.masicka, {name: chat.un}));
}
}
},
teaCommand: {
command: 'tea',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.tea, {name: chat.un}));
}
}
},
natalijaCommand: {
command: 'natalija',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.natalija, {name: chat.un}));
}
}
},
selmaCommand: {
command: 'selma',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.selma, {name: chat.un}));
}
}
},
roxorCommand: {
command: 'roxor',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.roxor, {name: chat.un}));
}
}
},
mujoCommand: {
command: 'mujo',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.mujo, {name: chat.un}));
}
}
},
filipCommand: {
command: ['filip', 'tjofi'],
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.filip, {name: chat.un}));
}
}
},
mamuzaCommand: {
command: 'mamuza',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.mamuza, {name: chat.un}));
}
}
},
cobraCommand: {
command: 'cobra',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.cobra, {name: chat.un}));
}
}
},
anjaCommand: {
command: 'anja',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.anja, {name: chat.un}));
}
}
},
smrtnikCommand: {
command: 'smrtnik',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.smrtnik, {name: chat.un}));
}
}
},
ahmedCommand: {
command: 'ahmed',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.ahmed, {name: chat.un}));
}
}
},
songunbanCommand: {
command: 'songunban',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.songunban, {name: chat.un}));
}
}
},
danceCommand: {
command: 'dance',
rank: 'mod',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.botwoot, {name: chat.un}));
$("#woot").click();
API.on(API.ADVANCE, autowoot);
function autowoot(){ $("#woot").click(); }
}
}
},
mehCommand: {
command: 'meh',
rank: 'mod',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.botmeh));
$("#meh").click();
API.on(API.ADVANCE, meh);
}
}
},
           /*autoruletteCommand: {
                command: 'autoroulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else { 
                    API.sendChat(subChat(bBot.chat.autorouletteon, {name: chat.un}));
                    var autoroulette = setInterval(function () { 
                    if (!bBot.room.roulette.rouletteStatus) {
    		    bBot.room.roulette.startRoulette();
    	            }
                   }, 7200000);
                    }
                   }
                  },*/

          /*autoruletteStopCommand: {
                command: 'autoroulettestop',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else { 
                    API.sendChat(subChat(bBot.chat.autorouletteoff, {name: chat.un}));
                    clearTimeout(autoroulette);
                    }
                   }
                  },*/


            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.room.roulette.rouletteStatus && bBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            bBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(bBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = bBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = bBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(bBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = bBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = bBot.userUtilities.getPermission(chat.uid);
                        var permTokick = bBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(bBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(bBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            stopCommand: {
                command: 'stop',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(bBot.chat.kill);
                        bBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
            command: 'language',
                
            rank: 'manager',
                
            type: 'startsWith',
            functionality: function (chat, cmd) {
                 if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                 if (!bBot.commands.executable(this.rank, chat)) return void (0)
                  else {
                   var msg = chat.message;
                   if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.currentlang, {language: bBot.settings.language}));
                  var argument = msg.substring(cmd.length + 1);

                  $.get("https://rawgit.com/MrAjdin/BalkanBot/master/Lang/langIndex.json", function (json) {
                  var langIndex = json;
                  var link = langIndex[argument.toLowerCase()];
                  if (typeof link === "undefined") {
                      API.sendChat(subChat(bBot.chat.langerror, {link: "#"}));
                  }
                  else {
                    bBot.settings.language = argument;
                    loadChat();
                    API.sendChat(subChat(bBot.chat.langset, {language: bBot.settings.language}));
                  }
               });
                    
             }
               
           }
           
         },


            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = bBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            bBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(bBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = bBot.userUtilities.lookupUser(chat.uid);
                        var perm = bBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://www.youtube.com/watch?v=" + media.cid;
                                API.sendChat(subChat(bBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(bBot.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        bBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = bBot.settings.lockdownEnabled;
                        bBot.settings.lockdownEnabled = !temp;
                        if (bBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.lockGuard) {
                            bBot.settings.lockGuard = !bBot.settings.lockGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.lockdown}));
                        }
                        else {
                            bBot.settings.lockGuard = !bBot.settings.lockGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            bBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(bBot.chat.usedlockskip, {name: chat.un}));
                                bBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    bBot.room.skippable = false;
                                    setTimeout(function () {
                                        bBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        bBot.userUtilities.moveUser(id, bBot.settings.lockskipPosition, false);
                                        bBot.room.queueable = true;
                                        setTimeout(function () {
                                            bBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < bBot.settings.lockskipReasons.length; i++) {
                                var r = bBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += bBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(bBot.chat.usedlockskip, {name: chat.un}));
                                bBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    bBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        bBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        bBot.userUtilities.moveUser(id, bBot.settings.lockskipPosition, false);
                                        bBot.room.queueable = true;
                                        setTimeout(function () {
                                            bBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            bBot.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(bBot.chat.lockskippos, {name: chat.un, position: bBot.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },
            
            // HiddenComand For someone special...
             adnaCommand: {
                command: 'adna',
                rank: 'user',
                type: 'startsWith',
                cookies: ['Kad nas tisuce kilometara razdvoje i kad najmanje mislis na mene, moje oci gledaju u daljinu i traze samo tebe.',
                'Tek kad andeli postanu zli, kad svi oceani presuse tad ce srce prestati gorjeti i ja su tebe prestati voljeti.',
                'Kad ti najteze bude ili kad osjetis da te nesto boli, sjeti se da postoji bice koje te vjecno i duboko... VOLI!.',
                'Reci mi da me ne trebas i otici cu. Reci da ti nije stalo i nestat cu. Reci da ti ne znacim nista, preboljet cu. Reci da me ne volis i umrijet cu..'
		
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.adna, {adna: this.getCookie()}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.selfadna, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfadna, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.selfadna, {adna: this.getCookie()}));
                            }
                        }
                    }
                }
            }, 
            
            fortunecookieCommand: {
                command: 'fortunecookie',
                rank: 'user',
                type: 'startsWith',
                cookies: ['Your shoes will make you happy today.',
                'You cannot love life until you live the life you love.',
                'The man or woman you desire feels the same about you.',
                'A dream you have will come true.',
                'Never give up. You are not a failure if you dont give up.',
                'You will become great if you believe in yourself.',
                'You will marry your lover.',
                'A very attractive person has a message for you.',
                'It is now, and in this world, that we must live.',
                'You must try, or hate yourself for not trying.',
                'You can make your own happiness.',
                'The greatest risk is not taking one.',
                'Love can last a lifetime, if you want it to.',
                'Serious trouble will bypass you.',
                'Now is the time to try something new.',
                'You are very talented in many ways.',
                'A stranger, is a friend you have not spoken to yet.',
                'You will travel to many exotic places in your lifetime.',
                'Everyone agrees. You are the best.',
                'Jealousy doesnt open doors, it closes them!',
                'Never give up. Always find a reason to keep trying.',
                'Stop wishing. Start doing.',
                'For success today, look first to yourself.',
                'If you are happy, you are successful.',
                'Before trying to please others think of what makes you happy.',
                'You learn from your mistakes, you will learn a lot today.',
                'Impossible is a word only to be found in the dictionary of fools.',
                'You will soon witness a miracle.',
                'Love is as necessary to human beings as food and shelter.',
                'You are extremely loved. Dont worry :)',
                'If you are never patient, you will never get anything done. If you believe you can do it, you will be rewarded with success.',
                'You believe in the goodness of man kind.',
                'You will have a long and wealthy life.',
                'You are a person of culture.',
                'Keep it simple. The more you say, the less people remember.',
                'Nothing seems impossible to you.',
                'Patience is bitter, but its fruit is sweet.',
                'When you expect your opponent to yield, you also should avoid hurting him.',
                'Your dearest wish will come true. ',
                'If you don’t do it excellently, don’t do it at all.',
                'You will soon be honored by someone you respect.',
                'Your smile brings happiness to everyone you meet. ',
                'A wish is what makes life happen when you dream of rose petals.',
                'Love can turn cottage into a golden palace. ',
                'You will kiss your crush ohhh lalahh',
                'No distance is too far, if two hearts are tied together. ',
                'Try? No! Do or do not, there is no try.',
                'Its about time you asked that special someone on a date.',
                'Good things take time.'
		
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.fortunecookie, {name: chat.un, fortune: this.getCookie()}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {name: name}));
                            }
                        }
                    }
                }
            }, 
            
            prcCommand: {
                command: 'prc',
                rank: 'bouncer',
                type: 'startsWith',
                cookies: ['Keva ti se kupa gola',
		'Nema ti danas kurca',
		'Vire ti stidne dlake',
		'Mamuza te kara',
		'Makse seljanko',
		'Nema ispale bez tebe',
		'Nes jebat',
		'Zanimljivo, skoro pa interesanto...',
		'Tvoja mama je tolko debela, da kad prolazi ispred TV-a prodje 4 epizode Srecnih ljudi',
		'Samo tetki da odnesem lek',
		'I tata bi sine',
		'Ti abanzujes!!!',
		'Sta se kacis na moju ogradu u tom pederskom odelu?'
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.selfprc, {name: name}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nouserprc, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfprc, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.prc, {nameto: user.username, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            }, 
            
            giftCommand: {
                command: 'gift',
                rank: 'user',
                type: 'startsWith',
                cookies: ['ti daje crvenu ruzu, ko zna mozda joj/mu se svidjas <3',
                          'misli da si super osoba, daj joj/mu poljubac <3',
                          'se zeli ozeniti sa tobom, reci da.',
                          'je zaljubljen/a u tebe, a ti?',
                          'misli da si prelijepa osoba, sta ti mislis o njemu/njoj?',
                          'zeli da te ubije......lool salim se, misli da si sladak/slatka',
                          'te zeli poljubiti',
                          'misli da si prelijepa osoba, daj joj/mu jedan zagrljaj',
                          'Da li me volis zato sto sam prelijep/a?',
                          'Onog trenutka kada te je vidjeo/la odmah se zaljubio/la u tebe',
                          'ne moze da zivi bez tebe',
                          'zeli provesti ostatak svog zivota sa tobom',
                          'je rekao. Zaljubljivanje u tebe je najbolja druga stvar na svijetu, jer pronalazak tebe je prva <3.'
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.bgift);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nouser, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfgift, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.gift, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },
            
            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            bBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(bBot.chat.lockguardtime, {name: chat.un, time: bBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            bBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(bBot.chat.maxlengthtime, {name: chat.un, time: bBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MOTD: ' + bBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!bBot.settings.motdEnabled) bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            bBot.settings.motd = argument;
                            API.sendChat(subChat(bBot.chat.motdset, {msg: bBot.settings.motd}));
                        }
                        else {
                            bBot.settings.motdInterval = argument;
                            API.sendChat(subChat(bBot.chat.motdintervalset, {interval: bBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === bBot.loggedInID) return API.sendChat(subChat(bBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(bBot.chat.move, {name: chat.un}));
                            bBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(bBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = bBot.userUtilities.getPermission(chat.uid);
                        var permUser = bBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             bBot.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(bBot.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(bBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = bBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             bBot.room.mutedUsers.splice(indexMuted);
                             var u = bBot.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(bBot.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(bBot.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(bBot.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(bBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(bBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(bBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(bBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.opLink === "string")
                            return API.sendChat(subChat(bBot.chat.oplist, {name: chat.un, link: bBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        bBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.reload);
                        storeToStorage();
                        bBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(bBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(bBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.etaRestriction) {
                            bBot.settings.etaRestriction = !bBot.settings.etaRestriction;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.etarestriction}));
                        }
                        else {
                            bBot.settings.etaRestriction = !bBot.settings.etaRestriction;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!bBot.room.roulette.rouletteStatus) {
                            bBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(bBot.chat.roomrules, {link: bBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = bBot.room.roomstats.totalWoots;
                        var mehs = bBot.room.roomstats.totalMehs;
                        var grabs = bBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(bBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        bBot.room.skippable = false;
                        setTimeout(function () {
                            bBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.songstats) {
                            bBot.settings.songstats = !bBot.settings.songstats;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.songstats}));
                        }
                        else {
                            bBot.settings.songstats = !bBot.settings.songstats;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me Bot edited by: ' + botCreator + '.');
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += bBot.chat.afkremoval + ': ';
                        if (bBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += bBot.chat.afksremoved + ": " + bBot.room.afkList.length + '. ';
                        msg += bBot.chat.afklimit + ': ' + bBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (bBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.lockguard + ': ';
                        if (bBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.cycleguard + ': ';
                        if (bBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.timeguard + ': ';
                        if (bBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.chatfilter + ': ';
                        if (bBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.voteskip + ': ';
                        if (bBot.settings.voteskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = bBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = bBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(bBot.chat.activefor, {time: since});

                        return API.sendChat(msg);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = bBot.userUtilities.lookupUserName(name1);
                        var user2 = bBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(bBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === bBot.loggedInID || user2.id === bBot.loggedInID) return API.sendChat(subChat(bBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(bBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(bBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            bBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                bBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            bBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                bBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.themeLink === "string")
                            API.sendChat(subChat(bBot.chat.genres, {link: bBot.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.timeGuard) {
                            bBot.settings.timeGuard = !bBot.settings.timeGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.timeguard}));
                        }
                        else {
                            bBot.settings.timeGuard = !bBot.settings.timeGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = bBot.settings.blacklistEnabled;
                        bBot.settings.blacklistEnabled = !temp;
                        if (bBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.blacklist}));
                    }
                }
            },                 

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.motdEnabled) {
                            bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.motd}));
                        }
                        else {
                            bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.motd}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(bBot.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        bBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = bBot.userUtilities.getPermission(chat.uid);
                        /**
                         if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                bBot.room.mutedUsers = [];
                                return API.sendChat(subChat(bBot.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(bBot.chat.unmuteeveryonerank, {name: chat.un}));
                        }
                         **/
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = bBot.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = bBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             var muted = bBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === user.id) {
                             indexMuted = i;
                             wasMuted = true;
                             }

                             }
                             if (!wasMuted) return API.sendChat(subChat(bBot.chat.notmuted, {name: chat.un}));
                             bBot.room.mutedUsers.splice(indexMuted);
                             API.sendChat(subChat(bBot.chat.unmuted, {name: chat.un, username: name}));
                             */
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(bBot.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(bBot.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(bBot.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            bBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(bBot.chat.commandscd, {name: chat.un, time: bBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.usercommands}));
                            bBot.settings.usercommandsEnabled = !bBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.usercommands}));
                            bBot.settings.usercommandsEnabled = !bBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(bBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.welcome) {
                            bBot.settings.welcome = !bBot.settings.welcome;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.welcomemsg}));
                        }
                        else {
                            bBot.settings.welcome = !bBot.settings.welcome;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.website === "string")
                            API.sendChat(subChat(bBot.chat.website, {link: bBot.settings.website}));
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(bBot.chat.youtube, {name: chat.un, link: bBot.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(bBot.startup);
}).call(this);
}
else {
alert("Pogresna sifra, pokusaj ponovo!")
}
