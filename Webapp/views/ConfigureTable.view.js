jQuery.sap.require("sap.crypto.app.Utility.ComponentGlobals");

sap.ui.jsview("sap.crypto.app.views.ConfigureTable", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.ConfigureTable";
   },

   createContent: function(oController) {

        var addChartBtn = new COMPONENT.Button({
                text: 'Add Chart',
                press: function(evt) { oController.addChart(); },
                width: "100%",
                layoutData : new COMPONENT.GridData({
                  span : "XL8 L8 M10 S10",
                  indent: "XL2 L2 M1 S1"
                })
            }).addStyleClass('addChartBtnColor'),
            firstRow = new COMPONENT.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [addChartBtn]
            }).addStyleClass('addChartBtnSpacing');


        var chartTemplate = new sap.ui.core.ListItem({
                text: '{' + oController.coinToChartModelId + '>name}'
            }),
            selectDefaultChart = new COMPONENT.ComboBox({
                id: oController.selectDefaultChartId,
                width: '100%',
                layoutData : new COMPONENT.GridData({
                  span : "XL5 L4 M5 S5",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.coinToChartModelId + '>/columns', chartTemplate),
            setDefaultBtn = new COMPONENT.Button({
                text: "Set Default Chart",
                tooltip: 'tests',
                width: "100%",
                press: function(oEvent) { oController.setDefaultChart(oEvent); },
                layoutData : new COMPONENT.GridData({
                  span : "XL3 L4 M5 S4",
                  indent: 'XL0 L0 M0 S0'
                })
            }).addStyleClass('removeBtnBorderRadiusLeft'),
            secondRow = new COMPONENT.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    selectDefaultChart,
                    setDefaultBtn
                ]
            });


        var removeBtn = new COMPONENT.Button({
                text: "Remove",
                width: "100%",
                press: function(oEvent) { oController.removeChartOrCoin() },
                layoutData : new COMPONENT.GridData({
                  span : "XL1 L2 M2 S3",
                  indent: 'XL0 L0 M0 S0'
                })
            }).addStyleClass('removeBtnBorderRadiusLeft').addStyleClass('removeBtnBorderRadiusRight'),
            segBtns = new COMPONENT.SegmentedButton({
                id: oController.segButtonsId,
                width: '100%',
                buttons: [
                    new COMPONENT.Button({
                        id: oController.removeChartId,
                        icon: 'sap-icon://line-chart',
                        width: "50%",
                        press: function(evt) { oController.switchComboBox(oController.chartMode); }
                    }),
                    new COMPONENT.Button({
                        id: oController.removeCoinId,
                        icon: 'sap-icon://lead',
                        width: "50%",
                        press: function(evt) { oController.switchComboBox(oController.coinMode); }
                    })
                ],
                layoutData : new COMPONENT.GridData({
                  span : "XL2 L2 M3 S3",
                })
            }),
            removeSelector = new COMPONENT.MultiComboBox({
                id: oController.removeSelectorId,
                width: '100%',
                layoutData : new COMPONENT.GridData({
                  span : "XL5 L4 M5 S5",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.coinToChartModelId + '>/columns', chartTemplate),
            thirdRow = new COMPONENT.Grid({
                id: oController.removeRowId,
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    removeSelector,
                    removeBtn,
                    segBtns
                ]
            }).addStyleClass('centerChildren');


        var vertLayout = new COMPONENT.VerticalLayout({
                id: oController.vertLayoutId,
                width: "100%",
                content: [
                    firstRow,
                    secondRow,
                    thirdRow
                ]
            }).addStyleClass('configPanelMargin');

        var chartManager = new COMPONENT.Table({
                id: oController.chartManagerTableId,
                width: '94%',
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

        console.log(chartManager.getHeaderToolbar());

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