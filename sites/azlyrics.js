var utils       =   require('../utils');
var rp          =   require('request-promise');
var cheerio     =   require('cheerio');
var winston     =   require('winston');
var Promise     =   require('promise');

const KEY = 'AZLyricsScrapper';

module.exports.scrape = function (url, originalQuery) {
    var options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        },
        agent: false
    };

    return rp(options)
        .then(function ($) {
            var artist = $('.lyricsh h2');
            var title = $('.lyricsh').next().next();
            var txt = title.next().next().next();
            var result = {
                artist: artist.text().replace(" LYRICS", ""),
                title: title.text().replace(/^"(.*)"$/, '$1'),
                coincidence: utils.coincidence(originalQuery, txt.text()),
                url: url
            };
            winston.debug(KEY, 'success', {result: result});
            return Promise.resolve(result);
        });
};