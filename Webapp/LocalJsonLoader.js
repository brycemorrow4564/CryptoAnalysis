var JSON_LOADER = {

    get_aggregate_json: function() {

        var data = '';
        $.ajax({
            async: false,
            url: './CryptoJSON/ALLCOINS.json',
            success: function(coinJson) {
                data = coinJson;
            },
            error: function(err) {
                console.log('error');
            },
            failure: function(err) {
                console.log('fail');
            }
        });
        return data;
    }

}
