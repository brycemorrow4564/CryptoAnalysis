const getSubredditUrls = () => {

    const request       = require('request'),
          cheerio       = require('cheerio'),
          async         = require('async'),
          asyncReqMod   = require('./asyncUrlRequestProcessor'),
          mainPageUrl       = 'https://coinmarketcap.com/all/views/all/',
          baseDetailPageUrl = 'https://coinmarketcap.com';

    request(mainPageUrl, (error, response, html) => {

            if (error) {
                console.log(error);
            }
            const $ = cheerio.load(html);
            var urls = [];

            var anchorTags = $('a.currency-name-container');
            anchorTags.each((index, element) => {
                var url = baseDetailPageUrl + element['attribs']['href'];
                urls.push(url);
            });

            urls = urls.slice(0, 250); //only look at top 250 cryptos

            /*
            urls: urls to request asynchronously
            50 is our limit of concurrent asynchronous requests
            dataParser.parse is callback function for finished results data
            pass references to async and request modules
            */
            asyncReqMod.asyncRequestUrls(urls, 50, extractMainWebpageLinks, async, request);

            const extractMainWebpageLinks = (results) => {

            }

    });

};

module.exports.getSubredditUrls = getSubredditUrls;