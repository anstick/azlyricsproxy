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
            var artist = $('.lyricsh h2').text().replace(" LYRICS", "");
            var title = $('.lyricsh').next().next().text().replace(/^"(.*)"$/, '$1');
            var txt = $('.lyricsh').next().next().next();
            while (txt && txt.get(0) && txt.get(0).name !== 'div'){
                txt = txt.next();
            }

            var result = {
                artist: artist,
                title: title,
                coincidence: utils.coincidence(originalQuery, txt? txt.text(): ""),
                url: url
            };
            winston.debug(KEY, 'success', {result: result});
            return Promise.resolve(result);
        });
};