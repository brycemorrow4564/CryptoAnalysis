sap.ui.jsfragment('sap.crypto.app.views.fragments.DragAndDropAlert', {

    createContent: function(oControlller) {

        var dialog = new sap.m.Dialog({
            title: "You can drag and drop coin name tiles to move them between charts",
            content: [
                new sap.ui.layout.Grid({
                    content: [
                        new sap.m.Button({
                            text: "Okay",
                            press: function(oEvent) { dialog.close(); },
                            layoutData: new sap.ui.layout.GridData({
                                span: "L8 M8 S8",
                                indent: "L2 M2 S2"
                            })
                        })
                    ]
                })
            ]
        });

        return dialog;

    }
});