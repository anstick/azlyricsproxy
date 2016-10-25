var _   =   require('underscore');

module.exports.coincidence = function(query, text) {
    var noSpaceText = text.replace(/\n|\r|\s/g, '').toLowerCase();

    if (noSpaceText.indexOf(query.toLowerCase().replace(/\s/g, '').toLowerCase())!== -1){
        return 1;
    }

    var res = 0;
    var words = query.split(' ');
    _.each(words,function (el) {
        if (noSpaceText.indexOf(el.toLowerCase()) !== -1){
            res+=1/words.length;
        }
    });

    return res;
};

module.exports.splitByWords = function (query, count) {
    var words = query.split(" ");

    var res = [];
    var temp = '';
    for (var i=0; i< words.length; i++){
        temp+= (temp? ' ': '') + words[i];
        if (i!==0 &&
            i%count === 0 &&
            (words.length - i - 1) > Math.floor(count/2) ||
            (i === words.length -1)){
            res.push(temp);
            temp = '';
        }
    }
    return res;
};