jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.CoinDetail", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.CoinDetail";
   },

   createContent: function(oController) {

        var noContentFormat = new COMPONENT.Title({
            id: oController.noContentMsgId,
            text: 'Add coins from sidebar to see graphs',
        }).addStyleClass('noContentTitle'),

            htmlStr = '';

        //Create divs for plotting all possible charts. Class included for easy jQuery access later on.
        for (var i = 1; i <= oController.maxNumCharts; i++) {
            htmlStr += "<div id='Chart " + i + "' class='CHARTDIV'></div>";
        }

        var html = new COMPONENT.HTML({
            content: htmlStr
        });

        var page = new COMPONENT.Page({
            id: oController.detailPageId,
            customHeader: new COMPONENT.Toolbar({
                content: [
                    new COMPONENT.ToolbarSpacer(),
                    new COMPONENT.HTML({
                        content: '<button id="AboutHeaderBtn"><span>About</span></button>' +
                                 '<button id="ConfigurationHeaderBtn"><span>Configuration</span></button>'
                    })
                ]
            }),
            content: [
                noContentFormat,
                html
            ]
        });

        page.onAfterRendering = function(evt) {

            if (sap.m.Page.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Page.prototype.onAfterRendering.apply(this);
            }

            //Hide all plotting charts as we have no data to plot
            $('.CHARTDIV').addClass('hideChart');

            //Link buttons to proper navigation functions
            $('#ConfigurationHeaderBtn').click(function(){
                oController.navToTableConfiguration();
            });
            $('#AboutHeaderBtn').click().click(function(){
                alert("Under construction");
                //IMPLEMENT THIS AND CREATE A NEW VIEW
                //oController.navToAboutPage();
            });
        };

        return page;
   }

});