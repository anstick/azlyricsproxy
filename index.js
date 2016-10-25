var dispatcher  =   require('httpdispatcher');
var http        =   require('http');
var winston     =   require('winston');
var url         =   require('url');


var AZLyricsScrapper = require('./sites/azlyrics');
var GeniusScrapper = require('./sites/genius');
http.globalAgent.maxSockets = Infinity;

const PORT= process.env.PORT || 8080;
const KEY = "ScrapperProxy";

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

    try {
        var parse = url.parse(uri);
    }
    catch (err) {
        res.writeHead(500);
        res.end('Internal error');
        winston.error(KEY, 'error', {reason: 'Uri verification failed', err: e});
        return;
    }

    var scrapper;
    try{
        winston.debug(KEY, 'Parse', parse);
        switch(parse.hostname){
            case 'azlyrics.com':
            case'www.azlyrics.com':
                scrapper = AZLyricsScrapper;
                break;
            case 'www.genius.com':
            case 'genius.com':
                scrapper = GeniusScrapper;
                break;
            default:
                throw new Error('Domain ' + parse.hostname + " isn't suppoted")
        }
    }
    catch (e){
        res.writeHead(400);
        res.end(e.message);
        winston.error(KEY, 'invalid domain', {domain: parse.hostname});
        return;
    }

    scrapper.scrape(uri, originalQuery).then(function (result) {
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