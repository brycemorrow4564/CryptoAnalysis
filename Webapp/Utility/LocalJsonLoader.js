var JSON_LOADER = {

    get_aggregate_json: function() {

        var data = '';
        $.ajax({
            async: false,
            url: '../CryptoJSON/ALLCOINS.json',
            success: function(coinJson) {
                data = coinJson;
            },
            failure: function(err) {
                console.log(err);
            }
        });
        return JSON.parse(data);
    }

}
