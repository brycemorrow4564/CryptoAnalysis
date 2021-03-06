const run = () => {

    const dataSource        = "redditmetrics",
          dataParser        = require('./../DataParsing/dataParser'),
          asyncReqMod       = require('./asyncUrlRequestProcessor'),
          asyncLimit        = 30,
          baseUrl           = 'http://redditmetrics.com/r/',
          subredditLinks    = ['iota',
                               'stellar',
                               'bitcoin',
                                'ethereum',
                                'ripple',
                                'bitcoincash',
                                'raiblocks',
                                'cardano',
                                'tronix',
                                'nem',
                                'litecoin',
                                'eos',
                                'monero',
                                'qtum',
                                'dashpay',
                                'neo',
                                'ethereumclassic',
                                'vergecurrency',
                                'icon',
                                'bitconnect',
                                'lisk',
                                'bitshares',
                                'BytecoinBCN',
                                'Siacoin',
                                'Zec',
                                'Omise_go',
                                'BNBTrader',
                                'status_token',
                                'Ardor',
                                'Dogecoin',
                                'Stratis',
                                'populous_platform',
                                'Steem',
                                'vechain',
                                'kucoin',
                                'wavesplatform',
                                'digibyte',
                                'komodoplatform',
                                'Dragonchain',
                                'hcash',
                                'kinfoundation',
                                'GolemProject',
                                'electroneum',
                                'augur',
                                'dentacoin',
                                'reddCoin',
                                'vericoin',
                                'FunfairTech',
                                'ArkEcosystem',
                                'Qash',
                                'decred',
                                'BATProject',
                                'ethos_io',
                                'SaltCoin',
                                'nexusearth',
                                'PowerLedger',
                                '0xProject',
                                'pivx',
                                'requestnetwork',
                                'aeternity',
                                'digitalNote',
                                'kybernetwork',
                                'bytomblockchain',
                                'NXT',
                                'factom',
                                'thebigXP',
                                'SubstratumNetwork',
                                'ByteBall',
                                'aionnetwork',
                                'monacoin',
                                'AElfTrader',
                                'WAX_io',
                                'maidsafe',
                                'santiment',
                                'poetproject',
                                'SysCoin',
                                'Iconomi',
                                'enigmacatalyst',
                                'rchain',
                                'Paccoin',
                                'zcoin',
                                'civicplatform',
                                'gnosispm',
                                'TenX',
                                'GXS',
                                'Digix',
                                'quantstamp',
                                'linktrader',
                                'chainlink',
                                'waltonchain',
                                'stormtoken',
                                'zclassic',
                                'enjincoin',
                                'timenewbank',
                                'neblio',
                                'gamecreditscrypto',
                                'raidennetwork',
                                'bancor',
                                'skycoinproject',
                                'storj',
                                'vertcoin',
                                'smartcash',
                                'unikoingold',
                                'xtrabytes',
                                'theblocknet',
                                'sonm',
                                'revain_org',
                                'bitbay',
                                'NavCoin',
                                'streamr',
                                'cindicator',
                                'centratech',
                                'medibloc',
                                'singulardtv',
                                'ubiq',
                                'district0x',
                                'monacocard',
                                'ripiocreditnetwork',
                                'airswap',
                                'decentraland',
                                'redpulsetoken',
                                'aragonproject',
                                'edgeless',
                                'burstcoin',
                                'ambrosus',
                                'einsteinium',
                                'iexec',
                                'metaverse_blockchain',
                                'electra',
                                'emercoin',
                                'mooncoin',
                                'wingsdao',
                                'AdEx',
                                'pillarproject',
                               'counterparty_xcp'].map((elem) => baseUrl + elem);


    /*
    example url would be http://redditmetrics.com/r/bitcoin
    We query each url in urls with this module, and the return data array includes the html from each of the pages
    that we requested. upon receiving this data array, we pass to our data processing callback
    */
    asyncReqMod.asyncRequestUrls(subredditLinks, dataSource, asyncLimit, dataParser.parseData);
};

module.exports.run = run;