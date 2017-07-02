var JSON_LOADER = {

    get_aggregate_json: function() {

        var data = '';
        $.ajax({
            async: false,
            url: '../CryptoJSON/ALLCOINS.json',
            success: function(coinJson) {
                data = coinJson;
            }
        });
        return data;
    },

    get_coin_json: function(coinName) {

    }

}