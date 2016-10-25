var _   =   require('underscore');


function prepareArray(str) {
    return str.replace(/[\r.,\/#!$%\^&\*;:{}=\-_\?`'~()]/g, '').replace(/^\s+|\s+$/g, '').replace(/\n/g,' ').replace(/\s\s/g, ' ').toLowerCase().split(' ');
}

module.exports.coincidence = function(query, text) {
    if (!text || !query){
        return -1;
    }

    var words = prepareArray(text);

    var vocab = {};
    _.each(words, function (el, index) {
        if (vocab[el]){
            vocab[el].push(index);
        }
        else{
            vocab[el] = [index];
        }
    });

    var dict = {};
    _.each(words, function (word, index) {
        if (_.has(dict, word)){
            dict[word].push(index);
        }
        else{
            dict[word] = [index];
        }
    });

    
    function findParts(parts) {
        var start = parts[0];
        if (!vocab[start]){
            return null;
        }

        var local_max = 1,
            start_index,
            next_part, next_part_vocab_index;

        for (var i=0; i<vocab[start].length; i++){
            var start_index = vocab[start][i];
            for(var j=1; j<parts.length; j++){
                next_part = parts[j];
                next_part_vocab_index = start_index + j;

                if (next_part_vocab_index >= words.length || words[next_part_vocab_index] !== next_part){
                    break;
                }

                local_max = Math.max(local_max, j+1);
                if (j === parts.length -1){
                    return local_max
                }
            }
        }
        return local_max
    }

    query = prepareArray(query);
    if (query.length < 1){
        return 0;
    }

    if (query.length == 1){
        return vocab[query[0]]?1:0;
    }

    var total = [],
        h, local_coincidence;

    for (var i=0; i<query.length; i++){
        h = findParts(query.slice(i));
        if (!_.isNull(h)){
            local_coincidence = h / query.length;
            if (local_coincidence === 1){
                return 1;
            } else{
                total.push(local_coincidence)
            }
        }
    }

    var res  = _.reduce(total, function(memo, num){ return memo + num; }, 0) / total.length;
    return res;
};