sap.ui.jsfragment('sap.crypto.app.views.fragments.DragAndDropAlert', {

    createContent: function(oControlller) {

        var dialog = new COMPONENT.Dialog({
            title: "You can drag and drop coin name tiles to move them between charts",
            content: [
                new COMPONENT.Grid({
                    content: [
                        new COMPONENT.Button({
                            text: "Okay",
                            press: function(oEvent) { dialog.close(); },
                            layoutData: new COMPONENT.GridData({
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