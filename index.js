var dispatcher  =   require('httpdispatcher');
var http        =   require('http');
var winston     =   require('winston');
var request     =   require('request');
var cheerio     =   require('cheerio');
var Promise     =   require('promise');
var rp          =   require('request-promise');
var url         =   require('url');
var utils       =   require('./utils');

require('http').globalAgent.maxSockets = Infinity;

const PORT= process.env.PORT || 8080;
const KEY = "AZLyricsProxy";

winston.level = process.env.LOG_LEVEL || 'error';

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    timestamp:true,
    handleExceptions: true,
    humanReadableUnhandledException: true
});


function handleRequest(request, response){
    try {
        winston.info(KEY, 'Handle', request.url);
        dispatcher.dispatch(request, response);
    } catch(err) {
       winston.error(KEY, 'Handle error ', err, {err:err});
    }
}

var server = http.createServer(handleRequest);
server.listen(PORT, function(){
    winston.info("Server listening on: http://localhost:%s", PORT);
});


//A sample GET request
dispatcher.onGet("/", function(req, res) {
    var uri  = req.params.url || "";
    var originalQuery = req.params.query|| "";

    winston.debug(KEY, 'Params', req.params);

    if (uri.length === 0 || originalQuery.length === 0){
        res.writeHead(400);
        res.end('Bad Request');

        winston.error(KEY, 'error', {reason: 'Empty params', params: req.params});
        return;
    }

    try{
        var parse = url.parse(uri);
        winston.debug(KEY, 'Parse', parse);
        if (['azlyrics.com', 'www.azlyrics.com'].indexOf(parse.hostname) === -1 ){
            res.writeHead(400);
            res.end('Bad uri. Only azlyrics.com requests are allowed');
            winston.error(KEY, 'error', {reason: 'Bad uri param', uri: uri});
            return;
        }
    }
    catch (e){
        res.writeHead(500);
        res.end('Internal error');
        winston.error(KEY, 'error', {reason: 'Uri verification failed', err: e});
        return;
    }

    var options = {
        uri: uri,
        transform: function (body) {
            return cheerio.load(body);
        },
        agent:false
    };

    rp(options)
        .then(function ($) {
            var artist = $('.lyricsh h2');
            var title = $('.lyricsh').next().next();
            var txt = title.next().next().next();
            var result = {
                artist: artist.text().replace(" LYRICS", ""),
                title: title.text().replace(/^"(.*)"$/, '$1'),
                coincidence: utils.coincidence(originalQuery, txt.text()),
                url: uri
            };
            winston.debug(KEY, 'success', {result: result});
            return Promise.resolve(result);
        })
        .then(function (result) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result));
        })
        .catch(function (err) {
            var data = {
                err: err,
                stack: err.stack && err.stack.split('\n')
            };
            winston.error(KEY, 'error', data);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data));
        });
});

dispatcher.onError(function(req, res) {
    res.writeHead(404);
    res.end('Not Found');
});