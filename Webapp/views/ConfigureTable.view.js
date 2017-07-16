jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.ConfigureTable", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.ConfigureTable";
   },

   createContent: function(oController) {

        var addChartBtn = new COMPONENT.Button({
                id: 'addChartBtn',
                text: 'Add Chart',
                icon: 'sap-icon://kpi-corporate-performance',
                press: function(evt) { oController.addChart(); },
                width: "100%",
                height: '40px', //hard coding this works because the controls it is associated with are NOT responsive
                layoutData : new COMPONENT.GridData({
                  span : "XL8 L8 M10 S10",
                  indent: "XL2 L2 M1 S1"
                })
            }).addStyleClass('addChartBtnColor');
        var firstRow = new COMPONENT.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [addChartBtn]
            }).addStyleClass('addChartBtnSpacing');

        //Used for multiple combo boxes that display items as all chart names in CoinToChart model
        var chartTemplate = new sap.ui.core.ListItem({
                text: '{' + oController.coinToChartModelId + '>name}'
            });

        var selectDefaultChart = new COMPONENT.ComboBox({
                id: oController.selectDefaultChartId,
                width: '100%',
                layoutData : new COMPONENT.GridData({
                  span : "XL6 L6 M6 S6",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.coinToChartModelId + '>/columns', chartTemplate);
        var setDefaultBtn = new COMPONENT.Button({
                text: "Set Default Chart",
                icon: 'sap-icon://opportunity',
                width: "100%",
                height: '40px',
                press: function(oEvent) { oController.setDefaultChart(oEvent); },
                layoutData : new COMPONENT.GridData({
                  span : "XL2 L2 M4 S4",
                })
            });
        var row = new COMPONENT.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    selectDefaultChart,
                    setDefaultBtn
                ]
            }).addStyleClass('centerChildren');


        var selectChartsToRemove = new COMPONENT.MultiComboBox({
                id: oController.selectChartsId,
                width: '100%',
                layoutData : new COMPONENT.GridData({
                  span : "XL6 L6 M6 S6",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.coinToChartModelId + '>/columns', chartTemplate);
        var removeChartBtn = new COMPONENT.Button({
                id: 'removeChartBtn', 
                text: "Remove Chart(s)",
                icon: 'sap-icon://line-chart',
                width: "100%",
                height: '40px',
                press: function(evt) { oController.removeCharts(); },
                layoutData : new COMPONENT.GridData({
                  span : "XL2 L2 M4 S4",
                })
            });
        var secondRow = new COMPONENT.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    selectChartsToRemove,
                    removeChartBtn
                ]
            }).addStyleClass('centerChildren');


        var coinTemplate = new sap.ui.core.ListItem({
                text: '{' + oController.allCoinsModelId + '>name}'
            });
        var selectMultiCoins = new COMPONENT.MultiComboBox({
                width: "100%",
                id: oController.selectCoinsId,
                layoutData : new COMPONENT.GridData({
                  span : "XL6 L6 M6 S6",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.allCoinsModelId + '>/coins', coinTemplate);
        var removeCoinsBtn = new COMPONENT.Button({
                text: "Remove Coin(s)",
                icon: 'sap-icon://lead',
                width: '100%',
                height: '40px',
                press: function(evt) { oController.removeCoins(); },
                layoutData : new COMPONENT.GridData({
                  span : "XL2 L2 M4 S4",
                })
            });
        var thirdRow = new COMPONENT.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    selectMultiCoins,
                    removeCoinsBtn
                ]
            }).addStyleClass('centerChildren');


        var vertLayout = new COMPONENT.VerticalLayout({
                width: "100%",
                content: [
                    firstRow,
                    row,
                    secondRow,
                    thirdRow
                ]
            }).addStyleClass('configPanelMargin');

        var chartManager = new COMPONENT.Table({
                id: oController.chartManagerTableId,
                columns: [
                    new COMPONENT.Column({
                        header: new COMPONENT.Label({
                            text: 'Chart'
                        }),
                        width: "20%"
                    }),
                    new COMPONENT.Column({
                        header: new COMPONENT.Label({
                            text: 'Coins'
                        })
                    })
                ]
            }).addStyleClass('chartTableMarker');

        chartManager.bindItems({
            path: oController.coinToChartModelId + ">/columns",
            factory: oController.generateCoinCells
        });

        chartManager.onAfterRendering = function() {
            if (sap.m.Table.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Table.prototype.onAfterRendering.apply(this);
            }
            $("#" + oController.chartManagerTableId + " button").draggable({
                cancel: false, //buttons disallowed for draggable by default so we deactivate this property
                helper: 'clone' //drags a clone of the button rather than the original element.
            });

            $("#" + oController.chartManagerTableId + " td").droppable({
                drop: function(event, ui) {
                    //first we determine if the component was dropped in an acceptable location
                    var targetDiv = $($(event.target).find('div')[0]);
                    if (targetDiv.hasClass('CoinContainerMarker')) {
                        //Now we know the target div is a valid coin container
                        //Now we determine if it was dropped in a different div from where it was originally
                        var dragBtnId = ui.draggable.context.id,
                            coinName  = sap.ui.getCore().byId(dragBtnId).getText();
                        if ($('#' + dragBtnId).parent()[0] == targetDiv[0]) {
                            //button was dropped in div it originated from so do nothing
                        } else {
                            //button was dropped in a new div so we can alter out model
                            var newChart = $($(targetDiv.parents('tr')[0]).find('label')[0]).context.innerText;
                            oController.moveCoinsToChart([coinName], newChart);
                        }
                    } else {
                        return;
                    }

                }
            })
        }

        return new COMPONENT.Page({
            showNavButton: true,
            navButtonTap:function(){
                  oController.navToCoinDetail();
            },
            content: [
                vertLayout,
                chartManager
            ]
        });
   }

});