/*
Script: More.js

name: More

description: MooTools More

license: MIT-style license

requires:
  - Core/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
    'version': '1.2.5.1',
    'build': '254884f2b83651bf95260eed5c6cceb838e22d8e'
};


/*
---

script: MooTools.Lang.js

name: MooTools.Lang

description: Provides methods for localization.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Events
  - /MooTools.More

provides: [Lang]

...
*/

(function(){

    var data = {
        language: 'en-US',
        languages: {
            'en-US': {}
        },
        cascades: ['en-US']
    };
    
    var cascaded;

    MooTools.lang = new Events();

    $extend(MooTools.lang, {

        setLanguage: function(lang){
            if (!data.languages[lang]) return this;
            data.language = lang;
            this.load();
            this.fireEvent('langChange', lang);
            return this;
        },

        load: function() {
            var langs = this.cascade(this.getCurrentLanguage());
            cascaded = {};
            $each(langs, function(set, setName){
                cascaded[setName] = this.lambda(set);
            }, this);
        },

        getCurrentLanguage: function(){
            return data.language;
        },

        addLanguage: function(lang){
            data.languages[lang] = data.languages[lang] || {};
            return this;
        },

        cascade: function(lang){
            var cascades = (data.languages[lang] || {}).cascades || [];
            cascades.combine(data.cascades);
            cascades.erase(lang).push(lang);
            var langs = cascades.map(function(lng){
                return data.languages[lng];
            }, this);
            return $merge.apply(this, langs);
        },

        lambda: function(set) {
            (set || {}).get = function(key, args){
                return $lambda(set[key]).apply(this, $splat(args));
            };
            return set;
        },

        get: function(set, key, args){
            if (cascaded && cascaded[set]) return (key ? cascaded[set].get(key, args) : cascaded[set]);
        },

        set: function(lang, set, members){
            this.addLanguage(lang);
            langData = data.languages[lang];
            if (!langData[set]) langData[set] = {};
            $extend(langData[set], members);
            if (lang == this.getCurrentLanguage()){
                this.load();
                this.fireEvent('langChange', lang);
            }
            return this;
        },

        list: function(){
            return Hash.getKeys(data.languages);
        }

    });

})();


/*
---

script: Class.Refactor.js

name: Class.Refactor

description: Extends a class onto itself with new property, preserving any items attached to the class's namespace.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

# Some modules declare themselves dependent on Class.Refactor
provides: [Class.refactor, Class.Refactor]

...
*/

Class.refactor = function(original, refactors){

    $each(refactors, function(item, name){
        var origin = original.prototype[name];
        if (origin && (origin = origin._origin ? origin._origin: origin) && typeof item == 'function') original.implement(name, function(){
            var old = this.previous;
            this.previous = origin;
            var value = item.apply(this, arguments);
            this.previous = old;
            return value;
        }); else original.implement(name, item);
    });

    return original;

};


/*
---

script: Array.Extras.js

name: Array.Extras

description: Extends the Array native object to include useful methods to work with arrays.

license: MIT-style license

authors:
  - Christoph Pojer

requires:
  - Core/Array

provides: [Array.Extras]

...
*/
Array.implement({

    min: function(){
        return Math.min.apply(null, this);
    },

    max: function(){
        return Math.max.apply(null, this);
    },

    average: function(){
        return this.length ? this.sum() / this.length : 0;
    },

    sum: function(){
        var result = 0, l = this.length;
        if (l){
            do {
                result += this[--l];
            } while (l);
        }
        return result;
    },

    unique: function(){
        return [].combine(this);
    },

    shuffle: function(){
        for (var i = this.length; i && --i;){
            var temp = this[i], r = Math.floor(Math.random() * ( i + 1 ));
            this[i] = this[r];
            this[r] = temp;
        }
        return this;
    }

});

/*
---

script: Date.js

name: Date

description: Extends the Date native object to include methods useful in managing dates.

license: MIT-style license

authors:
  - Aaron Newton
  - Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
  - Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
  - Scott Kyle - scott [at] appden.com; http://appden.com

requires:
  - Core/Array
  - Core/String
  - Core/Number
  - /Lang
  - /Date.English.US
  - /MooTools.More

provides: [Date]

...
*/

(function(){

var Date = this.Date;

if (!Date.now) Date.now = $time;

Date.Methods = {
    ms: 'Milliseconds',
    year: 'FullYear',
    min: 'Minutes',
    mo: 'Month',
    sec: 'Seconds',
    hr: 'Hours'
};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
    'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
    'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds', 'UTCMilliseconds'].each(function(method){
    Date.Methods[method.toLowerCase()] = method;
});

var pad = function(what, length){
    return new Array(length - String(what).length + 1).join('0') + what;
};

Date.implement({

    set: function(prop, value){
        switch ($type(prop)){
            case 'object':
                for (var p in prop) this.set(p, prop[p]);
                break;
            case 'string':
                prop = prop.toLowerCase();
                var m = Date.Methods;
                if (m[prop]) this['set' + m[prop]](value);
        }
        return this;
    },

    get: function(prop){
        prop = prop.toLowerCase();
        var m = Date.Methods;
        if (m[prop]) return this['get' + m[prop]]();
        return null;
    },

    clone: function(){
        return new Date(this.get('time'));
    },

    increment: function(interval, times){
        interval = interval || 'day';
        times = $pick(times, 1);

        switch (interval){
            case 'year':
                return this.increment('month', times * 12);
            case 'month':
                var d = this.get('date');
                this.set('date', 1).set('mo', this.get('mo') + times);
                return this.set('date', d.min(this.get('lastdayofmonth')));
            case 'week':
                return this.increment('day', times * 7);
            case 'day':
                return this.set('date', this.get('date') + times);
        }

        if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

        return this.set('time', this.get('time') + times * Date.units[interval]());
    },

    decrement: function(interval, times){
        return this.increment(interval, -1 * $pick(times, 1));
    },

    isLeapYear: function(){
        return Date.isLeapYear(this.get('year'));
    },

    clearTime: function(){
        return this.set({hr: 0, min: 0, sec: 0, ms: 0});
    },

    diff: function(date, resolution){
        if ($type(date) == 'string') date = Date.parse(date);
        
        return ((date - this) / Date.units[resolution || 'day'](3, 3)).round(); // non-leap year, 30-day month
    },

    getLastDayOfMonth: function(){
        return Date.daysInMonth(this.get('mo'), this.get('year'));
    },

    getDayOfYear: function(){
        return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1) 
            - Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
    },

    getWeek: function(){
        return (this.get('dayofyear') / 7).ceil();
    },
    
    getOrdinal: function(day){
        return Date.getMsg('ordinal', day || this.get('date'));
    },

    getTimezone: function(){
        return this.toString()
            .replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
            .replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
    },

    getGMTOffset: function(){
        var off = this.get('timezoneOffset');
        return ((off > 0) ? '-' : '+') + pad((off.abs() / 60).floor(), 2) + pad(off % 60, 2);
    },

    setAMPM: function(ampm){
        ampm = ampm.toUpperCase();
        var hr = this.get('hr');
        if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
        else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
        return this;
    },

    getAMPM: function(){
        return (this.get('hr') < 12) ? 'AM' : 'PM';
    },

    parse: function(str){
        this.set('time', Date.parse(str));
        return this;
    },

    isValid: function(date) {
        return !isNaN((date || this).valueOf());
    },

    format: function(f){
        if (!this.isValid()) return 'invalid date';
        f = f || '%x %X';
        f = formats[f.toLowerCase()] || f; // replace short-hand with actual format
        var d = this;
        return f.replace(/%([a-z%])/gi,
            function($0, $1){
                switch ($1){
                    case 'a': return Date.getMsg('days')[d.get('day')].substr(0, 3);
                    case 'A': return Date.getMsg('days')[d.get('day')];
                    case 'b': return Date.getMsg('months')[d.get('month')].substr(0, 3);
                    case 'B': return Date.getMsg('months')[d.get('month')];
                    case 'c': return d.toString();
                    case 'd': return pad(d.get('date'), 2);
                    case 'D': return d.get('date');
                    case 'e': return d.get('date');
                    case 'H': return pad(d.get('hr'), 2);
                    case 'I': return ((d.get('hr') % 12) || 12);
                    case 'j': return pad(d.get('dayofyear'), 3);
                    case 'm': return pad((d.get('mo') + 1), 2);
                    case 'M': return pad(d.get('min'), 2);
                    case 'o': return d.get('ordinal');
                    case 'p': return Date.getMsg(d.get('ampm'));
                    case 's': return Math.round(d / 1000);
                    case 'S': return pad(d.get('seconds'), 2);
                    case 'U': return pad(d.get('week'), 2);
                    case 'w': return d.get('day');
                    case 'x': return d.format(Date.getMsg('shortDate'));
                    case 'X': return d.format(Date.getMsg('shortTime'));
                    case 'y': return d.get('year').toString().substr(2);
                    case 'Y': return d.get('year');
                    case 'T': return d.get('GMTOffset');
                    case 'Z': return d.get('Timezone');
                    case 'z': return pad(d.get('ms'), 3);
                }
                return $1;
            }
        );
    },

    toISOString: function(){
        return this.format('iso8601');
    }

});

Date.alias('toISOString', 'toJSON');
Date.alias('diff', 'compare');
Date.alias('format', 'strftime');

var formats = {
    db: '%Y-%m-%d %H:%M:%S',
    compact: '%Y%m%dT%H%M%S',
    iso8601: '%Y-%m-%dT%H:%M:%S%T',
    rfc822: '%a, %d %b %Y %H:%M:%S %Z',
    'short': '%d %b %H:%M',
    'long': '%B %d, %Y %H:%M'
};

var parsePatterns = [];
var nativeParse = Date.parse;

var parseWord = function(type, word, num){
    var ret = -1;
    var translated = Date.getMsg(type + 's');
    switch ($type(word)){
        case 'object':
            ret = translated[word.get(type)];
            break;
        case 'number':
            ret = translated[word];
            if (!ret) throw new Error('Invalid ' + type + ' index: ' + word);
            break;
        case 'string':
            var match = translated.filter(function(name){
                return this.test(name);
            }, new RegExp('^' + word, 'i'));
            if (!match.length)    throw new Error('Invalid ' + type + ' string');
            if (match.length > 1) throw new Error('Ambiguous ' + type);
            ret = match[0];
    }

    return (num) ? translated.indexOf(ret) : ret;
};

Date.extend({

    getMsg: function(key, args) {
        return MooTools.lang.get('Date', key, args);
    },

    units: {
        ms: $lambda(1),
        second: $lambda(1000),
        minute: $lambda(60000),
        hour: $lambda(3600000),
        day: $lambda(86400000),
        week: $lambda(608400000),
        month: function(month, year){
            var d = new Date;
            return Date.daysInMonth($pick(month, d.get('mo')), $pick(year, d.get('year'))) * 86400000;
        },
        year: function(year){
            year = year || new Date().get('year');
            return Date.isLeapYear(year) ? 31622400000 : 31536000000;
        }
    },

    daysInMonth: function(month, year){
        return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    isLeapYear: function(year){
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    },

    parse: function(from){
        var t = $type(from);
        if (t == 'number') return new Date(from);
        if (t != 'string') return from;
        from = from.clean();
        if (!from.length) return null;

        var parsed;
        parsePatterns.some(function(pattern){
            var bits = pattern.re.exec(from);
            return (bits) ? (parsed = pattern.handler(bits)) : false;
        });

        return parsed || new Date(nativeParse(from));
    },

    parseDay: function(day, num){
        return parseWord('day', day, num);
    },

    parseMonth: function(month, num){
        return parseWord('month', month, num);
    },

    parseUTC: function(value){
        var localDate = new Date(value);
        var utcSeconds = Date.UTC(
            localDate.get('year'),
            localDate.get('mo'),
            localDate.get('date'),
            localDate.get('hr'),
            localDate.get('min'),
            localDate.get('sec'),
            localDate.get('ms')
        );
        return new Date(utcSeconds);
    },

    orderIndex: function(unit){
        return Date.getMsg('dateOrder').indexOf(unit) + 1;
    },

    defineFormat: function(name, format){
        formats[name] = format;
    },

    defineFormats: function(formats){
        for (var name in formats) Date.defineFormat(name, formats[name]);
    },

    parsePatterns: parsePatterns, // this is deprecated
    
    defineParser: function(pattern){
        parsePatterns.push((pattern.re && pattern.handler) ? pattern : build(pattern));
    },
    
    defineParsers: function(){
        Array.flatten(arguments).each(Date.defineParser);
    },
    
    define2DigitYearStart: function(year){
        startYear = year % 100;
        startCentury = year - startYear;
    }

});

var startCentury = 1900;
var startYear = 70;

var regexOf = function(type){
    return new RegExp('(?:' + Date.getMsg(type).map(function(name){
        return name.substr(0, 3);
    }).join('|') + ')[a-z]*');
};

var replacers = function(key){
    switch(key){
        case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
            return ((Date.orderIndex('month') == 1) ? '%m[-./]%d' : '%d[-./]%m') + '([-./]%y)?';
        case 'X':
            return '%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%T?';
    }
    return null;
};

var keys = {
    d: /[0-2]?[0-9]|3[01]/,
    H: /[01]?[0-9]|2[0-3]/,
    I: /0?[1-9]|1[0-2]/,
    M: /[0-5]?\d/,
    s: /\d+/,
    o: /[a-z]*/,
    p: /[ap]\.?m\.?/,
    y: /\d{2}|\d{4}/,
    Y: /\d{4}/,
    T: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.m = keys.I;
keys.S = keys.M;

var currentLanguage;

var recompile = function(language){
    currentLanguage = language;
    
    keys.a = keys.A = regexOf('days');
    keys.b = keys.B = regexOf('months');
    
    parsePatterns.each(function(pattern, i){
        if (pattern.format) parsePatterns[i] = build(pattern.format);
    });
};

var build = function(format){
    if (!currentLanguage) return {format: format};
    
    var parsed = [];
    var re = (format.source || format) // allow format to be regex
     .replace(/%([a-z])/gi,
        function($0, $1){
            return replacers($1) || $0;
        }
    ).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
     .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
     .replace(/%([a-z%])/gi,
        function($0, $1){
            var p = keys[$1];
            if (!p) return $1;
            parsed.push($1);
            return '(' + p.source + ')';
        }
    ).replace(/\[a-z\]/gi, '[a-z\\u00c0-\\uffff]'); // handle unicode words

    return {
        format: format,
        re: new RegExp('^' + re + '$', 'i'),
        handler: function(bits){
            bits = bits.slice(1).associate(parsed);
            var date = new Date().clearTime(),
                year = bits.y || bits.Y;
            
            if (year != null) handle.call(date, 'y', year); // need to start in the right year
            if ('d' in bits) handle.call(date, 'd', 1);
            if ('m' in bits || 'b' in bits || 'B' in bits) handle.call(date, 'm', 1);
            
            for (var key in bits) handle.call(date, key, bits[key]);
            return date;
        }
    };
};

var handle = function(key, value){
    if (!value) return this;

    switch(key){
        case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
        case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
        case 'd': return this.set('date', value);
        case 'H': case 'I': return this.set('hr', value);
        case 'm': return this.set('mo', value - 1);
        case 'M': return this.set('min', value);
        case 'p': return this.set('ampm', value.replace(/\./g, ''));
        case 'S': return this.set('sec', value);
        case 's': return this.set('ms', ('0.' + value) * 1000);
        case 'w': return this.set('day', value);
        case 'Y': return this.set('year', value);
        case 'y':
            value = +value;
            if (value < 100) value += startCentury + (value < startYear ? 100 : 0);
            return this.set('year', value);
        case 'T':
            if (value == 'Z') value = '+00';
            var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
            offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
            return this.set('time', this - offset * 60000);
    }

    return this;
};

Date.defineParsers(
    '%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
    '%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
    '%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
    '%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
    '%b( %d%o)?( %Y)?( %X)?', // Same as above with month and day switched
    '%Y %b( %d%o( %X)?)?', // Same as above with year coming first
    '%o %b %d %X %T %Y' // "Thu Oct 22 08:11:23 +0000 2009"
);

MooTools.lang.addEvent('langChange', function(language){
    if (MooTools.lang.get('Date')) recompile(language);
}).fireEvent('langChange', MooTools.lang.getCurrentLanguage());

})();


/*
---

script: Date.Extras.js

name: Date.Extras

description: Extends the Date native object to include extra methods (on top of those in Date.js).

license: MIT-style license

authors:
  - Aaron Newton
  - Scott Kyle

requires:
  - /Date

provides: [Date.Extras]

...
*/

Date.implement({

    timeDiffInWords: function(relative_to){
        return Date.distanceOfTimeInWords(this, relative_to || new Date);
    },

    timeDiff: function(to, joiner){
        if (to == null) to = new Date;
        var delta = ((to - this) / 1000).toInt();
        if (!delta) return '0s';
        
        var durations = {s: 60, m: 60, h: 24, d: 365, y: 0};
        var duration, vals = [];
        
        for (var step in durations){
            if (!delta) break;
            if ((duration = durations[step])){
                vals.unshift((delta % duration) + step);
                delta = (delta / duration).toInt();
            } else {
                vals.unshift(delta + step);
            }
        }
        
        return vals.join(joiner || ':');
    }

});

Date.alias('timeDiffInWords', 'timeAgoInWords');

Date.extend({

    distanceOfTimeInWords: function(from, to){
        return Date.getTimePhrase(((to - from) / 1000).toInt());
    },

    getTimePhrase: function(delta){
        var suffix = (delta < 0) ? 'Until' : 'Ago';
        if (delta < 0) delta *= -1;
        
        var units = {
            minute: 60,
            hour: 60,
            day: 24,
            week: 7,
            month: 52 / 12,
            year: 12,
            eon: Infinity
        };
        
        var msg = 'lessThanMinute';
        
        for (var unit in units){
            var interval = units[unit];
            if (delta < 1.5 * interval){
                if (delta > 0.75 * interval) msg = unit;
                break;
            }
            delta /= interval;
            msg = unit + 's';
        }
        
        return Date.getMsg(msg + suffix, delta).substitute({delta: delta.round()});
    }

});


Date.defineParsers(

    {
        // "today", "tomorrow", "yesterday"
        re: /^(?:tod|tom|yes)/i,
        handler: function(bits){
            var d = new Date().clearTime();
            switch(bits[0]){
                case 'tom': return d.increment();
                case 'yes': return d.decrement();
                default:    return d;
            }
        }
    },

    {
        // "next Wednesday", "last Thursday"
        re: /^(next|last) ([a-z]+)$/i,
        handler: function(bits){
            var d = new Date().clearTime();
            var day = d.getDay();
            var newDay = Date.parseDay(bits[2], true);
            var addDays = newDay - day;
            if (newDay <= day) addDays += 7;
            if (bits[1] == 'last') addDays -= 7;
            return d.set('date', d.getDate() + addDays);
        }
    }

);


/*
---

script: Hash.Extras.js

name: Hash.Extras

description: Extends the Hash native object to include getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Hash.base
  - /MooTools.More

provides: [Hash.Extras]

...
*/

Hash.implement({

    getFromPath: function(notation){
        var source = this.getClean();
        notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match){
            if (!source) return null;
            var prop = arguments[2] || arguments[1] || arguments[0];
            source = (prop in source) ? source[prop] : null;
            return match;
        });
        return source;
    },

    cleanValues: function(method){
        method = method || $defined;
        this.each(function(v, k){
            if (!method(v)) this.erase(k);
        }, this);
        return this;
    },

    run: function(){
        var args = arguments;
        this.each(function(v, k){
            if ($type(v) == 'function') v.run(args);
        });
    }

});

/*
---

script: String.Extras.js

name: String.Extras

description: Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

license: MIT-style license

authors:
  - Aaron Newton
  - Guillermo Rauch
  - Christopher Pitt

requires:
  - Core/String
  - Core/$util
  - Core/Array

provides: [String.Extras]

...
*/

(function(){

var special = {
    'a': '[àáâãäåăą]',
    'A': '[ÀÁÂÃÄÅĂĄ]',
    'c': '[ćčç]',
    'C': '[ĆČÇ]',
    'd': '[ďđ]',
    'D': '[ĎÐ]',
    'e': '[èéêëěę]',
    'E': '[ÈÉÊËĚĘ]',
    'g': '[ğ]',
    'G': '[Ğ]',
    'i': '[ìíîï]',
    'I': '[ÌÍÎÏ]',
    'l': '[ĺľł]',
    'L': '[ĹĽŁ]',
    'n': '[ñňń]',
    'N': '[ÑŇŃ]',
    'o': '[òóôõöøő]',
    'O': '[ÒÓÔÕÖØ]',
    'r': '[řŕ]',
    'R': '[ŘŔ]',
    's': '[ššş]',
    'S': '[ŠŞŚ]',
    't': '[ťţ]',
    'T': '[ŤŢ]',
    'ue': '[ü]',
    'UE': '[Ü]',
    'u': '[ùúûůµ]',
    'U': '[ÙÚÛŮ]',
    'y': '[ÿý]',
    'Y': '[ŸÝ]',
    'z': '[žźż]',
    'Z': '[ŽŹŻ]',
    'th': '[þ]',
    'TH': '[Þ]',
    'dh': '[ð]',
    'DH': '[Ð]',
    'ss': '[ß]',
    'oe': '[œ]',
    'OE': '[Œ]',
    'ae': '[æ]',
    'AE': '[Æ]'
},

tidy = {
    ' ': '[\xa0\u2002\u2003\u2009]',
    '*': '[\xb7]',
    '\'': '[\u2018\u2019]',
    '"': '[\u201c\u201d]',
    '...': '[\u2026]',
    '-': '[\u2013]',
    '--': '[\u2014]',
    '&raquo;': '[\uFFFD]'
};

function walk(string, replacements) {
    var result = string;

    for (key in replacements) {
        result = result.replace(new RegExp(replacements[key], 'g'), key);
    }

    return result;
}

function getRegForTag(tag, contents) {
    tag = tag || '';
    var regstr = contents ? "<" + tag + "(?!\\w)[^>]*>([\\s\\S]*?)<\/" + tag + "(?!\\w)>" : "<\/?" + tag + "([^>]+)?>";
    reg = new RegExp(regstr, "gi");
    return reg;
};

String.implement({

    standardize: function(){
        return walk(this, special);
    },

    repeat: function(times){
        return new Array(times + 1).join(this);
    },

    pad: function(length, str, dir){
        if (this.length >= length) return this;
        var pad = (str == null ? ' ' : '' + str).repeat(length - this.length).substr(0, length - this.length);
        if (!dir || dir == 'right') return this + pad;
        if (dir == 'left') return pad + this;
        return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
    },

    getTags: function(tag, contents){
        return this.match(getRegForTag(tag, contents)) || [];
    },

    stripTags: function(tag, contents){
        return this.replace(getRegForTag(tag, contents), '');
    },

    tidy: function(){
        return walk(this, tidy);
    }

});

})();


/*
---

script: String.QueryString.js

name: String.QueryString

description: Methods for dealing with URI query strings.

license: MIT-style license

authors:
  - Sebastian Markbåge, Aaron Newton, Lennart Pilon, Valerio Proietti

requires:
  - Core/Array
  - Core/String
  - /MooTools.More

provides: [String.QueryString]

...
*/

String.implement({

    parseQueryString: function(decodeKeys, decodeValues){
        if (decodeKeys == null) decodeKeys = true;
        if (decodeValues == null) decodeValues = true;
        var vars = this.split(/[&;]/), res = {};
        if (vars.length) vars.each(function(val){
            var index = val.indexOf('='),
                keys = index < 0 ? [''] : val.substr(0, index).match(/([^\]\[]+|(\B)(?=\]))/g),
                value = decodeValues ? decodeURIComponent(val.substr(index + 1)) : val.substr(index + 1),
                obj = res;
            keys.each(function(key, i){
                if (decodeKeys) key = decodeURIComponent(key);
                var current = obj[key];
                if(i < keys.length - 1)
                    obj = obj[key] = current || {};
                else if($type(current) == 'array')
                    current.push(value);
                else
                    obj[key] = $defined(current) ? [current, value] : value;
            });
        });
        return res;
    },

    cleanQueryString: function(method){
        return this.split('&').filter(function(val){
            var index = val.indexOf('='),
            key = index < 0 ? '' : val.substr(0, index),
            value = val.substr(index + 1);
            return method ? method.run([key, value]) : $chk(value);
        }).join('&');
    }

});

/*
---

script: URI.js

name: URI

description: Provides methods useful in managing the window location and uris.

license: MIT-style license

authors:
  - Sebastian Markbåge
  - Aaron Newton

requires:
  - Core/Selectors
  - /String.QueryString

provides: [URI]

...
*/

var URI = new Class({

    Implements: Options,

    options: {
        /*base: false*/
    },

    regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
    parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
    schemes: {http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0},

    initialize: function(uri, options){
        this.setOptions(options);
        var base = this.options.base || URI.base;
        if(!uri) uri = base;
        
        if (uri && uri.parsed) this.parsed = $unlink(uri.parsed);
        else this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
    },

    parse: function(value, base){
        var bits = value.match(this.regex);
        if (!bits) return false;
        bits.shift();
        return this.merge(bits.associate(this.parts), base);
    },

    merge: function(bits, base){
        if ((!bits || !bits.scheme) && (!base || !base.scheme)) return false;
        if (base){
            this.parts.every(function(part){
                if (bits[part]) return false;
                bits[part] = base[part] || '';
                return true;
            });
        }
        bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
        bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
        return bits;
    },

    parseDirectory: function(directory, baseDirectory) {
        directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
        if (!directory.test(URI.regs.directoryDot)) return directory;
        var result = [];
        directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
            if (dir == '..' && result.length > 0) result.pop();
            else if (dir != '.') result.push(dir);
        });
        return result.join('/') + '/';
    },

    combine: function(bits){
        return bits.value || bits.scheme + '://' +
            (bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
            (bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
            (bits.directory || '/') + (bits.file || '') +
            (bits.query ? '?' + bits.query : '') +
            (bits.fragment ? '#' + bits.fragment : '');
    },

    set: function(part, value, base){
        if (part == 'value'){
            var scheme = value.match(URI.regs.scheme);
            if (scheme) scheme = scheme[1];
            if (scheme && !$defined(this.schemes[scheme.toLowerCase()])) this.parsed = { scheme: scheme, value: value };
            else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
        } else if (part == 'data') {
            this.setData(value);
        } else {
            this.parsed[part] = value;
        }
        return this;
    },

    get: function(part, base){
        switch(part){
            case 'value': return this.combine(this.parsed, base ? base.parsed : false);
            case 'data' : return this.getData();
        }
        return this.parsed[part] || '';
    },

    go: function(){
        document.location.href = this.toString();
    },

    toURI: function(){
        return this;
    },

    getData: function(key, part){
        var qs = this.get(part || 'query');
        if (!$chk(qs)) return key ? null : {};
        var obj = qs.parseQueryString();
        return key ? obj[key] : obj;
    },

    setData: function(values, merge, part){
        if (typeof values == 'string'){
            data = this.getData();
            data[arguments[0]] = arguments[1];
            values = data;
        } else if (merge) {
            values = $merge(this.getData(), values);
        }
        return this.set(part || 'query', Hash.toQueryString(values));
    },

    clearData: function(part){
        return this.set(part || 'query', '');
    }

});

URI.prototype.toString = URI.prototype.valueOf = function(){
    return this.get('value');
};

URI.regs = {
    endSlash: /\/$/,
    scheme: /^(\w+):/,
    directoryDot: /\.\/|\.$/
};

URI.base = new URI(document.getElements('base[href]', true).getLast(), {base: document.location});

String.implement({

    toURI: function(options){
        return new URI(this, options);
    }

});


/*
---

script: URI.Relative.js

name: URI.Relative

description: Extends the URI class to add methods for computing relative and absolute urls.

license: MIT-style license

authors:
  - Sebastian Markbåge


requires:
  - /Class.refactor
  - /URI

provides: [URI.Relative]

...
*/

URI = Class.refactor(URI, {

    combine: function(bits, base){
        if (!base || bits.scheme != base.scheme || bits.host != base.host || bits.port != base.port)
            return this.previous.apply(this, arguments);
        var end = bits.file + (bits.query ? '?' + bits.query : '') + (bits.fragment ? '#' + bits.fragment : '');

        if (!base.directory) return (bits.directory || (bits.file ? '' : './')) + end;

        var baseDir = base.directory.split('/'),
            relDir = bits.directory.split('/'),
            path = '',
            offset;

        var i = 0;
        for(offset = 0; offset < baseDir.length && offset < relDir.length && baseDir[offset] == relDir[offset]; offset++);
        for(i = 0; i < baseDir.length - offset - 1; i++) path += '../';
        for(i = offset; i < relDir.length - 1; i++) path += relDir[i] + '/';

        return (path || (bits.file ? '' : './')) + end;
    },

    toAbsolute: function(base){
        base = new URI(base);
        if (base) base.set('directory', '').set('file', '');
        return this.toRelative(base);
    },

    toRelative: function(base){
        return this.get('value', new URI(base));
    }

});


/*
---

script: Assets.js

name: Assets

description: Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Event
  - /MooTools.More

provides: [Assets]

...
*/

var Asset = {

    javascript: function(source, properties){
        properties = $extend({
            onload: $empty,
            document: document,
            check: $lambda(true)
        }, properties);
        
        if (properties.onLoad) {
            properties.onload = properties.onLoad;
            delete properties.onLoad;
        }
        var script = new Element('script', {src: source, type: 'text/javascript'});

        var load = properties.onload.bind(script), 
            check = properties.check, 
            doc = properties.document;
        delete properties.onload;
        delete properties.check;
        delete properties.document;

        script.addEvents({
            load: load,
            readystatechange: function(){
                if (['loaded', 'complete'].contains(this.readyState)) load();
            }
        }).set(properties);

        if (Browser.Engine.webkit419) var checker = (function(){
            if (!$try(check)) return;
            $clear(checker);
            load();
        }).periodical(50);

        return script.inject(doc.head);
    },

    css: function(source, properties){
        properties = properties || {};
        var onload = properties.onload || properties.onLoad;
        if (onload) {
            properties.events = properties.events || {};
            properties.events.load = onload;
            delete properties.onload;
            delete properties.onLoad;
        }
        return new Element('link', $merge({
            rel: 'stylesheet',
            media: 'screen',
            type: 'text/css',
            href: source
        }, properties)).inject(document.head);
    },

    image: function(source, properties){
        properties = $merge({
            onload: $empty,
            onabort: $empty,
            onerror: $empty
        }, properties);
        var image = new Image();
        var element = document.id(image) || new Element('img');
        ['load', 'abort', 'error'].each(function(name){
            var type = 'on' + name;
            var cap = name.capitalize();
            if (properties['on' + cap]) {
                properties[type] = properties['on' + cap];
                delete properties['on' + cap];
            }
            var event = properties[type];
            delete properties[type];
            image[type] = function(){
                if (!image) return;
                if (!element.parentNode){
                    element.width = image.width;
                    element.height = image.height;
                }
                image = image.onload = image.onabort = image.onerror = null;
                event.delay(1, element, element);
                element.fireEvent(name, element, 1);
            };
        });
        image.src = element.src = source;
        if (image && image.complete) image.onload.delay(1);
        return element.set(properties);
    },

    images: function(sources, options){
        options = $merge({
            onComplete: $empty,
            onProgress: $empty,
            onError: $empty,
            properties: {}
        }, options);
        sources = $splat(sources);
        var images = [];
        var counter = 0;
        return new Elements(sources.map(function(source, index){
            return Asset.image(source, $extend(options.properties, {
                onload: function(){
                    options.onProgress.call(this, counter, index);
                    counter++;
                    if (counter == sources.length) options.onComplete();
                },
                onerror: function(){
                    options.onError.call(this, counter, index);
                    counter++;
                    if (counter == sources.length) options.onComplete();
                }
            }));
        }));
    }

};

/*
---

script: Date.English.US.js

name: Date.English.US

description: Date messages for US English.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Lang

provides: [Date.English.US]

...
*/

MooTools.lang.set('en-US', 'Date', {

    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    // Culture's date order: MM/DD/YYYY
    dateOrder: ['month', 'date', 'year'],
    shortDate: '%m/%d/%Y',
    shortTime: '%I:%M%p',
    AM: 'AM',
    PM: 'PM',

    // Date.Extras
    ordinal: function(dayOfMonth){
        // 1st, 2nd, 3rd, etc.
        return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
    },

    lessThanMinuteAgo: 'less than a minute ago',
    minuteAgo: 'about a minute ago',
    minutesAgo: '{delta} minutes ago',
    hourAgo: 'about an hour ago',
    hoursAgo: 'about {delta} hours ago',
    dayAgo: '1 day ago',
    daysAgo: '{delta} days ago',
    weekAgo: '1 week ago',
    weeksAgo: '{delta} weeks ago',
    monthAgo: '1 month ago',
    monthsAgo: '{delta} months ago',
    yearAgo: '1 year ago',
    yearsAgo: '{delta} years ago',

    lessThanMinuteUntil: 'less than a minute from now',
    minuteUntil: 'about a minute from now',
    minutesUntil: '{delta} minutes from now',
    hourUntil: 'about an hour from now',
    hoursUntil: 'about {delta} hours from now',
    dayUntil: '1 day from now',
    daysUntil: '{delta} days from now',
    weekUntil: '1 week from now',
    weeksUntil: '{delta} weeks from now',
    monthUntil: '1 month from now',
    monthsUntil: '{delta} months from now',
    yearUntil: '1 year from now',
    yearsUntil: '{delta} years from now'

});
