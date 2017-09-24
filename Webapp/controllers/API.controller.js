$.sap.require('sap.crypto.app.Utility.Globals');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.define([
   "sap/ui/core/mvc/Controller"
], function (Controller) {
   "use strict";
   return Controller.extend("sap.crypto.app.controllers.API", {

        apiListId       : 'APIList',
        apiModelId      : 'APIModel',
        donateListId    : 'DonateList',
        donateModelId   : "DonateModel",

        onInit: function() {

            var urlPrefix = 'https://tranquil-bastion-27755.herokuapp.com/';
//            var urlPrefix = 'http://localhost:8080',
                apiObj = {
                    "API_functions" : [
                        {
                            "url"   : urlPrefix + '/coins/',
                            "data"  : "Get data for all top 100 coins (Market Cap, Daily Price, Volume)."
                        },
                        {
                            "url"   : urlPrefix + '/coins/coinName',
                            "data"  : "Get data for single coin (Market Cap, Daily Price, Volume)."
                        },
                        {
                            "url"   : urlPrefix + '/all_coin_names/',
                            "data"  : "Get names of top 100 coins."
                        },
                    ]
                },
                donateObj = {
                    "DonateKeys" : [
                        {
                            "currency"  : "bitcoin",
                            "address"   : "1BZ5T5zzw9DAGzbnFVMDUaiefFhzkV6fdB"
                        },
                        {
                            "currency"  : "ethereum",
                            "address"   : "0x7a99c0f92e75ef8fca12dd3c6e6c4b38e40586ab"
                        }
                    ]
                };

            var apiModel = new sap.ui.model.json.JSONModel(apiObj);
            var apiList  = sap.ui.getCore().byId(this.apiListId);
            apiList.setModel(apiModel, this.apiModelId);

            var donateModel = new sap.ui.model.json.JSONModel(donateObj);
            var donateList  = sap.ui.getCore().byId(this.donateListId);
            donateList.setModel(donateModel, this.donateModelId);
        }

   });
});