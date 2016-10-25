var utils       =   require('../utils');
var rp          =   require('request-promise');
var cheerio     =   require('cheerio');
var winston     =   require('winston');
var Promise     =   require('promise');

const KEY = 'MusixMatchScrapper';

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
            var artist = $('.mxm-track-title__artist.mxm-track-title__artist-link');
            var title = $('.mxm-track-title__track');
            var txt = '';
            $('.mxm-lyrics__content').each(function(  ) {
                txt += $( this ).text();
            });
            var result = {
                artist: artist.text(),
                title: title.text(),
                coincidence: utils.coincidence(originalQuery, txt),
                url: url
            };
            winston.debug(KEY, 'success', {result: result});
            return Promise.resolve(result);
        });
};