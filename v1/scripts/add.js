const Add = {
    DOM: {
        load: function() {
            this.submit = $(".case-submit");
            this.inputs = $(".case-input");

            this.overlay = $("#js-case-overlay");
            this.dialog = $("#js-case-dialog");
            this.timer = $("#js-case-timer");

            this.gender = $("#db-gender");
        }
    },
    load: function() {
        $("#js-case-main").load(`cases.html`, function() {
            //Make UI inputs work
            $(document).trigger("case:load_start");
            Add.DOM.load();

            Add.DOM.gender.trigger("ui:load", "u");
            Add.DOM.gender.trigger("ui:set", "u");

            Add.loadSubmit();
        });

    },
    loadSubmit: function() {
        Add.DOM.submit.on("click", function() {

            let data = {};

            let empty = false;
            Add.DOM.inputs.each(function() {
                if (!Add.getInput($(this), data)) {
                    empty = true;
                }
            });

            if (empty) {
                Add.overlay.showDialog({
                    header: "caution",
                    text: `You have left one or more fields blank.</br></br>
                            Are you sure you want to add this case?`,
                    buttons: [
                        {
                            text: "Submit",
                            style: "yes",
                            click: function() {
                                Add.submitPage(data);
                            }
                        },
                        {
                            text: "Cancel",
                            style: "no",
                            click: function() {
                                Add.overlay.hideDialog();
                            }
                        }
                    ]
                });

            } else {
                Add.overlay.showDialog({
                    header: "warning",
                    text: `Are you sure you want to add this case?`,
                    buttons: [
                        {
                            text: "Submit",
                            style: "yes",
                            click: function() {
                                Add.submitPage(data);
                            }
                        },
                        {
                            text: "Cancel",
                            style: "no",
                            click: function() {
                                Add.overlay.hideDialog();
                            }
                        }
                    ]
                });

            }

        });
    },
    submitPage(data) {
        Add.overlay.hideDialog();
        Add.overlay.showTimer();

        data.status = "active";
        data.active_timestamp = API.data.convertDateTime(new Date());

        API.post(data, function(id) {
            window.location.replace(`./case.html?case_id=${id}`);
        });
    },
    getInput: function(element, data) {
        let key = element.attr("id").slice(3);

        let obj = {
            val: null
        };
        element.trigger("ui:get", obj);
        return data[key] = obj.val;

    },
    overlay: {
        showTimer() {
            this.loading = true;
            Add.DOM.overlay.removeClass("hidden");
            Add.DOM.timer.removeClass("hidden");
        },
        hideTimer() {
            this.loading = false;
            Add.DOM.overlay.addClass("hidden");
            Add.DOM.timer.addClass("hidden");
        },
        loading: false,
        dialog_active: false,
        showDialog(settings) {
            this.dialog_active = true;
            Add.DOM.overlay.removeClass("hidden");

            let header = Add.DOM.dialog.find("header");
            header.empty();
            header.removeClass();
            switch (settings.header) {
                case "error":
                    header.addClass("error");
                    break;
                case "caution":
                    header.addClass("caution");
                    header.html(`
                        <img src="icons/button/warning.png" />
                        <span>Caution Advised</span>
                        `);
                    break;
                case "warning":
                    header.addClass("warning");
                    header.html(`
                        <img src="icons/button/warning.png" />
                        <span>Warning</span>
                        `);
                    break;
            }

            let main = Add.DOM.dialog.find("main");
            main.empty();
            main.html(settings.text);

            let buttons = Add.DOM.dialog.find("aside");
            buttons.empty();
            $.each(settings.buttons, function(index, option) {
                let button = $(`<button>${option.text}</button>`);
                button.addClass(option.style);
                button.on("click", option.click);

                buttons.append(button);
            });

            Add.DOM.dialog.fadeIn({
                duration: 250
            });
            Add.DOM.dialog.removeClass("hidden");
        },
        hideDialog() {
            this.dialog_active = false;
            Add.DOM.dialog.fadeOut();
            Add.DOM.dialog.addClass("hidden");
            Add.DOM.overlay.addClass("hidden");
        }
    }
}

/*const Add = {
    counter: 1,
    load: function() {
        DOM_Main.add_button.on("click", function() {
            console.log("ADD");
            API.post({
                status: "active",
                first_name: "New",
                last_name: "Patient " + Add.counter,
                gender: "u",
                active_timestamp: API.data.convertDateTime(new Date())
            }, function() {
                counter++;
                Cases.load();
            });
        });
    }
}*/


$(document).ready(function() {
    Add.load();
});
