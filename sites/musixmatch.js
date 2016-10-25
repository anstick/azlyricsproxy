var utils       =   require('../utils');
var rp          =   require('request-promise');
var cheerio     =   require('cheerio');
var winston     =   require('winston');
var Promise     =   require('promise');

const KEY = 'MusixMatchScrapper';

module.exports.scrape = function (url, originalQuery) {
    var s_body = "";
    var options = {
        uri: url,
        transform: function (body) {
            s_body = body;
            return cheerio.load(body);
        },
        agent: false
    };

    return rp(options)
        .then(function ($) {
            var artist = $('.mxm-track-title__artist.mxm-track-title__artist-link').text();
            var title = $('.mxm-track-title__track').text();
            var txt = '';
            $('.mxm-lyrics__content').each(function(  ) {
                txt += $( this ).text();
            });

            if (!artist || !title || !txt){
                winston.debug(KEY, 'body error', {result: s_body});
            }
            
            var result = {
                artist: artist,
                title: title,
                coincidence: utils.coincidence(originalQuery, txt),
                url: url
            };
            winston.debug(KEY, 'success', {result: result});
            return Promise.resolve(result);
        });
};