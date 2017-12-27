$.sap.require("sap.crypto.app.Utility.ComponentGlobals");
$.sap.require("sap.crypto.app.Utility.Globals");
$.sap.require('sap.crypto.app.Utility.GenerateCustomHeader');
$.sap.require('sap.crypto.app.Utility.RouterGeneral');

sap.ui.jsview("sap.crypto.app.views.ConfigureTable", {

   getControllerName: function() {
      return "sap.crypto.app.controllers.ConfigureTable";
   },

   createContent: function(oController) {

        var pageInfo = new sap.m.Button({
            id: "InfoButton",
            text: "   How To   ",
            press: function(oEvent) { oController.displayPopover(oEvent); }
        });

        var addChartBtn = new sap.m.Button({
                text: 'Add Chart',
                press: function(evt) { oController.addChart(); },
                width: "100%",
                layoutData : new sap.ui.layout.GridData({
                  span : "XL3 L3 M4 S4",
                  indent: "XL2 L2 M1 S1"
                })
            }).addStyleClass('configBtnMedia'),
            resetConfigBtn = new sap.m.Button({
                text: 'Reset Config',
                press: function(evt) { oController.resetConfig(); },
                width: "100%",
                layoutData : new sap.ui.layout.GridData({
                    span : "XL3 L3 M4 S4",
                    indent: "XL2 L2 M2 S2"
                })
            }).addStyleClass('configBtnMedia'),
            addChartResetConfigRow = new sap.ui.layout.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    addChartBtn,
                    resetConfigBtn
                ]
            });

        var modeTemplate = new sap.ui.core.ListItem({
                text: '{' + GLOBALS.dataModeModelId + '>name}'
            }),
            dataModeSelector = new sap.m.ComboBox({
                id: oController.dataModeSelectorId,
                width: '100%',
                layoutData : new sap.ui.layout.GridData({
                  span : "XL4 L4 M5 S5",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(GLOBALS.dataModeModelId + '>/modes', modeTemplate),
            setDataModeBtn = new sap.m.Button({
                text: 'Set Data Mode',
                width: '100%',
                press: function(oEvent) {
                    oController.setDataMode(oEvent);
                },
                layoutData : new sap.ui.layout.GridData({
                  span : "XL4 L4 M5 S5",
                  indent: 'XL0 L0 M0 S0'
                })
            }).addStyleClass('removeBtnBorderRadiusLeft').addStyleClass('configBtnMedia'),
            dataModeRow = new sap.ui.layout.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    dataModeSelector,
                    setDataModeBtn
                ]
            });
            dataModeSelector.bindProperty('placeholder', GLOBALS.dataModeModelId + '>/active', function(val) {
                return val; //Display daily price instead of open or just normal val
            });


        var chartTemplate = new sap.ui.core.ListItem({
                text: '{' + oController.coinToChartModelId + '>name}'
            }),
            selectDefaultChart = new sap.m.ComboBox({
                id: oController.selectDefaultChartId,
                width: '100%',
                placeholder: GLOBALS.defaultChartId,
                layoutData : new sap.ui.layout.GridData({
                  span : "XL4 L4 M5 S5",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.coinToChartModelId + '>/columns', chartTemplate),
            setDefaultBtn = new sap.m.Button({
                text: "Set Default Add Chart",
                width: "100%",
                press: function(oEvent) {
                    oController.setDefaultChart(oEvent);
                },
                layoutData : new sap.ui.layout.GridData({
                  span : "XL4 L4 M5 S5",
                  indent: 'XL0 L0 M0 S0'
                })
            }).addStyleClass('removeBtnBorderRadiusLeft').addStyleClass('configBtnMedia'),
            setDefaultRow = new sap.ui.layout.Grid({
                hSpacing: 0,
                vSpacing: 0,
                width: "100%",
                content: [
                    selectDefaultChart,
                    setDefaultBtn
                ]
            });


        var removeBtn = new sap.m.Button({
                text: "Remove",
                width: "100%",
                press: function(oEvent) { oController.removeChartOrCoin() },
                layoutData : new sap.ui.layout.GridData({
                  span : "XL2 L2 M2 S2",
                  indent: 'XL0 L0 M0 S0'
                })
            }).addStyleClass('removeBtnBorderRadiusLeft').addStyleClass('removeBtnBorderRadiusRight').addStyleClass('configBtnMedia'),
            segBtns = new sap.m.SegmentedButton({
                id: oController.segButtonsId,
                width: '100%',
                buttons: [
                    new sap.m.Button({
                        id: oController.removeChartId,
                        icon: 'sap-icon://area-chart',
                        width: "50%",
                        press: function(evt) { oController.switchComboBox(oController.chartMode); }
                    }).addStyleClass('configIconBtnMedia'),
                    new sap.m.Button({
                        id: oController.removeCoinId,
                        icon: 'sap-icon://lead',
                        width: "50%",
                        press: function(evt) { oController.switchComboBox(oController.coinMode); }
                    }).addStyleClass('configIconBtnMedia')
                ],
                layoutData : new sap.ui.layout.GridData({
                  span : "XL2 L2 M3 S3",
                })
            }),
            removeSelector = new sap.m.MultiComboBox({
                id: oController.removeSelectorId,
                width: '100%',
                placeholder: 'Remove Charts',
                layoutData : new sap.ui.layout.GridData({
                  span : "XL4 L4 M5 S5",
                  indent: "XL2 L2 M1 S1"
                })
            }).bindItems(oController.coinToChartModelId + '>/columns', chartTemplate),
            removeRow = new sap.ui.layout.Grid({
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

        var vertLayout = new sap.ui.layout.VerticalLayout({
                id: oController.vertLayoutId,
                width: "100%",
                content: [
                    dataModeRow,
                    setDefaultRow,
                    removeRow,
                    addChartResetConfigRow,
                ]
            }).addStyleClass('configPanelMargin');

        var chartManager = new sap.m.Table({
                id: oController.chartManagerTableId,
                width: '90%',
                columns: [
                    new sap.m.Column({
                        header: new sap.m.Label({
                            text: 'Chart'
                        }),
                        width: "22%"
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({
                            text: 'Coins'
                        })
                    })
                ],
                updateFinished: function() { //Each time table updates, we want to bold the default chart for improved UI experience

                    if (sap.m.Table.prototype.updateFinished) { //apply any default behavior so we don't override essential things
                        sap.m.Table.prototype.updateFinished.apply(this);
                    }

                    $("label.sapMLabel").each(function(label) {
                        if ($(this).context.innerHTML === GLOBALS.defaultChartId) {
                            $(this).addClass('boldDefaultChart');
                        } else {
                            $(this).removeClass('boldDefaultChart');
                        }
                    })
                }
            }).addStyleClass('chartTableMarker');

        chartManager.bindItems({
            path: oController.coinToChartModelId + ">/columns",
            factory: oController.generateCoinCells
        });

        chartManager.onAfterRendering = function() {
            if (sap.m.Table.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Table.prototype.onAfterRendering.apply(this);
            }

            //Implement jQuery draggable function
            $("#" + oController.chartManagerTableId + " button").draggable({
                cancel: false, //buttons disallowed for draggable by default so we deactivate this property
                helper: 'clone', //drags a clone of the button rather than the original element.
                drag: function(event, ui) {
                    $(event.target).removeClass('sapMBtnActive');
                }
            });

            //Implement jQuery droppable function
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
                        alert('here');
                        console.log($('#' + ui.draggable.context.id));
                        return;
                    }

                }
            })
        }

        var page = new sap.m.Page({
            customHeader: CUSTOM_HEADER_GENERATOR.getCustomHeader(oController.getView()),
            content: [
                pageInfo,
                vertLayout,
                chartManager
            ]
        });

        page.onAfterRendering = function(evt) {
            if (sap.m.Page.prototype.onAfterRendering) { //apply any default behavior so we don't override essential things
                sap.m.Page.prototype.onAfterRendering.apply(this);
            }
            ROUTER.setupHeaderRouting();

            var topOffset = $('.sapMPageHeader').height() - 3;
            $('.header-bottom-border').css('top', topOffset);
        };

        return page;
   }

});