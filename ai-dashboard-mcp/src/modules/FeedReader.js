import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

class FeedReader {
  constructor(feedUrls, options = {}) {
    this.feeds = feedUrls.map((url) => ({
      url,
      raw: null,
      type: null,
      title: null,
      link: null,
      items: [],
      error: null,
      eventFile: null,
    }));

    this.options = {
      newItemMinutes: 60,
      maxItems: 10,
      writeEvents: false,
      writeHistory: false,
      keepOldItems: false,
      historyFile: 'FeedReaderHistory.xml',
      ...options,
    };

    this.currentFeedIndex = 0;
    this.history = {};
    this.timeZones = {
      IDLW: -12,
      NT: -11,
      CAT: -10,
      HST: -10,
      HDT: -9,
      YST: -9,
      YDT: -8,
      PST: -8,
      PDT: -7,
      MST: -7,
      MDT: -6,
      CST: -6,
      CDT: -5,
      EST: -5,
      EDT: -4,
      AST: -3,
      ADT: -2,
      WAT: -1,
      GMT: 0,
      UTC: 0,
      Z: 0,
      WET: 0,
      BST: 1,
      CET: 1,
      MET: 1,
      MEWT: 1,
      MEST: 2,
      CEST: 2,
      MESZ: 2,
      FWT: 1,
      FST: 2,
      EET: 2,
      EEST: 3,
      WAST: 7,
      WADT: 8,
      CCT: 8,
      JST: 9,
      EAST: 10,
      EADT: 11,
      GST: 10,
      NZT: 12,
      NZST: 12,
      NZDT: 13,
      IDLE: 12,
    };

    this.monthAcronyms = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };

    this.characterReferences = {
      '#x2018': 34,
      '#8211': 45,
      '#039': 39,
      '#8216': 39,
      '#8217': 39,
      '#8218': 39,
      '#8219': 39,
      '#8220': 34,
      '#8221': 34,
      quot: 34,
      amp: 38,
      apos: 39,
      lt: 60,
      gt: 62,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      copy: 169,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      reg: 174,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      sup1: 185,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      Agrave: 192,
      Aacute: 193,
      Acirc: 194,
      Atilde: 195,
      Auml: 196,
      Aring: 197,
      AElig: 198,
      Ccedil: 199,
      Egrave: 200,
      Eacute: 201,
      Ecirc: 202,
      Euml: 203,
      Igrave: 204,
      Iacute: 205,
      Icirc: 206,
      Iuml: 207,
      ETH: 208,
      Ntilde: 209,
      Ograve: 210,
      Oacute: 211,
      Ocirc: 212,
      Otilde: 213,
      Ouml: 214,
      times: 215,
      Oslash: 216,
      Ugrave: 217,
      Uacute: 218,
      Ucirc: 219,
      Uuml: 220,
      Yacute: 221,
      THORN: 222,
      szlig: 223,
      agrave: 224,
      aacute: 225,
      acirc: 226,
      atilde: 227,
      auml: 228,
      aring: 229,
      aelig: 230,
      ccedil: 231,
      egrave: 232,
      eacute: 233,
      ecirc: 234,
      euml: 235,
      igrave: 236,
      iacute: 237,
      icirc: 238,
      iuml: 239,
      eth: 240,
      ntilde: 241,
      ograve: 242,
      oacute: 243,
      ocirc: 244,
      otilde: 245,
      ouml: 246,
      divide: 247,
      oslash: 248,
      ugrave: 249,
      uacute: 250,
      ucirc: 251,
      uuml: 252,
      yacute: 253,
      thorn: 254,
      yuml: 255,
    };
  }

  // Initialize feeds and history
  async initialize() {
    await this.loadHistory();
    this.defineTypes();
    this.defineEventFiles();
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(this.options.historyFile, 'utf8');
      const regexFeed = /<feed URL="(.*?)">(.*?)<\/feed>/gs;
      let match;
      while ((match = regexFeed.exec(data)) !== null) {
        const url = match[1];
        const content = match[2];
        this.history[url] = [];
        const regexItem = /<item>(.*?)<\/item>/gs;
        let itemMatch;
        while ((itemMatch = regexItem.exec(content)) !== null) {
          const itemXml = itemMatch[1];
          const item = {};
          const regexKeyVal = /<(\w+)>(.*?)<\/\w+>/g;
          let kvMatch;
          while ((kvMatch = regexKeyVal.exec(itemXml)) !== null) {
            let key = kvMatch[1];
            let value = kvMatch[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            item[key] = isNaN(value) ? value : Number(value);
          }
          if (item.Date) item.Date = Number(item.Date);
          if (item.Unread) item.Unread = Number(item.Unread);
          this.history[url].push(item);
        }
      }
    } catch (err) {
      // No history file yet
    }
  }

  defineTypes() {
    this.Types = {
      RSS: {
        MatchLink: /<link.*?>(.*?)<\/link>/,
        MatchItem: /<item[\s\S]*?<\/item>/g,
        MatchItemID: /<guid.*?>(.*?)<\/guid>/,
        MatchItemLink: /<link.*?>(.*?)<\/link>/,
        MatchItemDesc: /<description.*?>(.*?)<\/description>/,
        MatchItemDate: /<pubDate.*?>(.*?)<\/pubDate>/,
        MatchItemDate2: /<dc:date>(.*?)<\/dc:date>/,
        MergeItems: true,
        ParseDate: (s) => {
          if (!s) return null;
          const matchTime = /^.*?, (\d+) (\w+) (\d+) (\d+):(\d+):(\d+) (.+)$/;
          const matchDate = /^.*?, (\d+) (\w+) (\d+)$/;
          let m = s.match(matchTime);
          if (m) {
            return {
              day: Number(m[1]),
              month: this.monthAcronyms[m[2]],
              year: Number(m[3]),
              hour: Number(m[4]),
              min: Number(m[5]),
              sec: Number(m[6]),
              Offset: m[7],
            };
          }
          m = s.match(matchDate);
          if (m) {
            return {
              day: Number(m[1]),
              month: this.monthAcronyms[m[2]],
              year: Number(m[3]),
            };
          }
          return null;
        },
      },
      Atom: {
        MatchLink: /<link.*?href=["'](.*?)["']/,
        MatchItem: /<entry[\s\S]*?<\/entry>/g,
        MatchItemID: /<id.*?>(.*?)<\/id>/,
        MatchItemLink: /<link.*?href=["'](.*?)["']/,
        MatchItemDesc: /<summary.*?>(.*?)<\/summary>/,
        MatchItemDate: /<updated.*?>(.*?)<\/updated>/,
        MergeItems: true,
        ParseDate: (s) => {
          if (!s) return null;
          const matchTime = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+\.?\d*)(.*)$/;
          const matchDate = /^(\d+)-(\d+)-(\d+)$/;
          let m = s.match(matchTime);
          if (m) {
            return {
              year: Number(m[1]),
              month: Number(m[2]),
              day: Number(m[3]),
              hour: Number(m[4]),
              min: Number(m[5]),
              sec: Number(m[6]),
              Offset: m[7],
            };
          }
          m = s.match(matchDate);
          if (m) {
            return {
              year: Number(m[1]),
              month: Number(m[2]),
              day: Number(m[3]),
            };
          }
          return null;
        },
      },
      GoogleCalendar: {
        MatchLink: /<link.*?rel=.*?alternate.*?href=["'](.*?)["']/,
        MatchItem: /<entry[\s\S]*?<\/entry>/g,
        MatchItemID: /<id.*?>(.*?)<\/id>/,
        MatchItemLink: /<link.*?href=["'](.*?)["']/,
        MatchItemDesc: /<summary.*?>(.*?)<\/summary>/,
        MatchItemDate: /startTime=["'](.*?)["']/,
        MergeItems: false,
        ParseDate: (s) => {
          if (!s) return null;
          const matchTime = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)\.\d+(.*)$/;
          const matchDate = /^(\d+)-(\d+)-(\d+)$/;
          let m = s.match(matchTime);
          if (m) {
            return {
              year: Number(m[1]),
              month: Number(m[2]),
              day: Number(m[3]),
              hour: Number(m[4]),
              min: Number(m[5]),
              sec: Number(m[6]),
              Offset: m[7],
            };
          }
          m = s.match(matchDate);
          if (m) {
            return {
              year: Number(m[1]),
              month: Number(m[2]),
              day: Number(m[3]),
            };
          }
          return null;
        },
      },
      RememberTheMilk: {
        MatchLink: /<link.*?rel=.*?alternate.*?href=["'](.*?)["']/,
        MatchItem: /<entry[\s\S]*?<\/entry>/g,
        MatchItemID: /<id.*?>(.*?)<\/id>/,
        MatchItemLink: /<link.*?href=["'](.*?)["']/,
        MatchItemDesc: /<summary.*?>(.*?)<\/summary>/,
        MatchItemDate: /<span class=["']rtm_due_value["']>(.*?)<\/span>/,
        MergeItems: false,
        ParseDate: (s) => {
          if (!s) return null;
          // Example: Wed 7 Nov 12 at 3:17PM
          const matchTime = /^\w+ (\d+) (\w+) (\d+) at (\d+):(\d+)(AM|PM)$/;
          const matchDate = /^\w+ (\d+) (\w+) (\d+)$/;
          let m = s.match(matchTime);
          if (m) {
            return {
              day: Number(m[1]),
              month: this.monthAcronyms[m[2]],
              year: Number(m[3]),
              hour: Number(m[4]),
              min: Number(m[5]),
              Meridiem: m[6],
            };
          }
          m = s.match(matchDate);
          if (m) {
            return {
              day: Number(m[1]),
              month: this.monthAcronyms[m[2]],
              year: Number(m[3]),
            };
          }
          return null;
        },
      },
    };
  }

  identifyType(xmlStr) {
    if (xmlStr.rss) return 'RSS';
    if (xmlStr.feed) {
      if (xmlStr.feed['xmlns:gCal']) return 'GoogleCalendar';
      if (xmlStr.feed.subtitle === 'rememberthemilk.com') return 'RememberTheMilk';
      return 'Atom';
    }
    return null;
  }

    decodeCharacterReference(str, maxLoops = 0) {
    if (typeof str !== 'string') return str;
    let loops = 0;
    let replaced;
    do {
      replaced = false;
      for (const [find, charCode] of Object.entries(this.characterReferences)) {
        const regex = new RegExp(`&${find};`, 'g');
        if (regex.test(str)) {
          str = str.replace(regex, String.fromCharCode(charCode));
          replaced = true;
        }
      }
      loops++;
    } while (replaced && (maxLoops === 0 || loops < maxLoops));
    return str;
  }

  identifyDate(dateStr) {
    for (const type of Object.values(this.Types)) {
      const parsedDate = type.ParseDate(dateStr);
      if (parsedDate) return parsedDate;
    }
    return null;
  }

  defineEventFiles() {
    if (this.options.writeEvents || this.options.writeHistory) {
      this.feeds.forEach((feed, i) => {
        const fileName = `feed_${i + 1}_events.xml`;
        feed.eventFile = fileName;
      });
    }
  }

  getCurrentFeed() {
    return this.feeds[this.currentFeedIndex];
  }

  showNext() {
    this.currentFeedIndex = (this.currentFeedIndex + 1) % this.feeds.length;
  }

  showPrevious() {
    this.currentFeedIndex = (this.currentFeedIndex - 1 + this.feeds.length) % this.feeds.length;
  }

  async update() {
    const feed = this.getCurrentFeed();
    try {
      const response = await fetch(feed.url);
      const rawXml = await response.text();

      if (rawXml === feed.raw) return false; // No change

      feed.raw = rawXml;
      this.parseFeed(feed);
      return true;
    } catch (err) {
      feed.error = {
        title: 'Fetch Error',
        description: err.message,
        link: feed.url,
      };
      return false;
    }
  }

  parseFeed(feed) {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const jsonObj = parser.parse(feed.raw);

    feed.type = this.identifyType(jsonObj);

    if (feed.type === 'RSS') {
      feed.title = jsonObj.rss?.channel?.title ?? '';
      feed.link = jsonObj.rss?.channel?.link ?? '';
      feed.items = (jsonObj.rss?.channel?.item ?? []).slice(0, this.options.maxItems).map(item => ({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: new Date(item.pubDate),
        unread: true,
      }));
    } else if (feed.type === 'Atom') {
      feed.title = jsonObj.feed?.title ?? '';
      feed.link = jsonObj.feed?.link?.href ?? '';
      feed.items = (jsonObj.feed?.entry ?? []).slice(0, this.options.maxItems).map(item => ({
        title: item.title,
        link: item.link?.href ?? '',
        description: item.summary,
        pubDate: new Date(item.updated),
        unread: true,
      }));
    }
    // Add other feed type handlers if needed
  }
} 
