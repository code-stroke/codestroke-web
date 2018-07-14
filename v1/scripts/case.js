const DOM_Case = {
    load: function() {
        DOM_Case.case.load();
        DOM_Case.ed.load();
        DOM_Case.history.load();
        DOM_Case.assess.load();
        DOM_Case.radiology.load();
    },
    case: {
        load: function() {
            DOM_Case.case.btns = $(".js-case-button");
            DOM_Case.case.main = $("#js-case-main");

            DOM_Case.case.overlay = $("#js-case-overlay");
            DOM_Case.case.timer = $("#js-case-timer");
            DOM_Case.case.dialog = $("#js-case-dialog");

            DOM_Case.case.inputs = ".case-input";
            DOM_Case.case.submits = ".case-submit";

            DOM_Case.case.patient = $("#js-patient");
            DOM_Case.case.name = $("#js-patient-name");
            DOM_Case.case.age_gender = $("#js-patient-age_gender");
            DOM_Case.case.status = $("#js-patient-status");
            DOM_Case.case.time = $("#js-patient-time");
            DOM_Case.case.well = $("#js-patient-well");
        }
    },
    ed: {
        load: function() {
            DOM_Case.ed.loc = "#js-ed-loc";
            DOM_Case.ed.complete = "ed_complete";
        }
    },
    history: {
        load: function() {
            DOM_Case.history.anticoags = "#db-anticoags";
            DOM_Case.history.last_dose = "#js-history-last_dose";
        }
    },
    assess: {
        load: function() {
            DOM_Case.assess.btns = ".js-assess-button";
            DOM_Case.assess.section = "#js-assess-section";
            DOM_Case.assess.mass = "#js-assess-mass";
            DOM_Case.assess.vitals = "#js-assess-vitals";
            DOM_Case.assess.race = "#js-assess-race";
            DOM_Case.assess.race_score = "#js-assess-race-score";
            DOM_Case.assess.cannula = "#js-assess-cannula";
            DOM_Case.assess.nihss = "#js-assess-nihss";
            DOM_Case.assess.nihss_score = "#js-assess-nihss-score";
            DOM_Case.assess.mrs = "#js-assess-mrs";
            DOM_Case.assess.mrs_score = "#js-assess-mrs-score";
            DOM_Case.assess.submit = "#js-assess-submit";
        }
    },
    radiology: {
        load: function() {
            DOM_Case.radiology.progress = "#js-radiology-progress"
        }
    }
};

const Case = {
    case_id: null,
    section: "",
    section_data: null,
    load: function() {
        Case.case_id = new URL(window.location.href).searchParams.get("case_id");

        if (!Case.case_id) {
            window.location.href = "/index.html";
        } else {
            API.get("cases", Case.case_id, Case.fillPatient);
        }

        Case.loadPageLoader();
        Case.loadSubmit();
    },
    loadSubmit: function() {
        $("body").on("click", DOM_Case.case.submits, function() {

            Case.overlay.showDialog({
                header: "warning",
                text: "Are you sure you want to Submit?",
                buttons: [
                    {
                        text: "Submit",
                        style: "yes",
                        click: function() {
                            Case.submitPage();
                        }
                    },
                    {
                        text: "Cancel",
                        style: "no",
                        click: function() {
                            Case.overlay.hideDialog();
                        }
                    }
                ]
            });
        });

    },
    submitPage: function() {
        Case.overlay.hideDialog();
        Case.overlay.showTimer();

        let data = {};
        data.case_id = Case.case_id;

        $(DOM_Case.case.inputs).each(function() {
            Case.getInput($(this), data);
        });

        console.log(data);

        API.put(Case.section, Case.case_id, data, function(result) {
            console.log(result);

            API.get(Case.section, Case.case_id, function(info) {
                Case.fillPage(info);
                if (Case.section == "cases") {
                    Case.fillPatient(info);
                }
            });
        });
    },
    fillPatient: function(patient) {
        if (!patient) {
            window.location.href = "/index.html";
        }

        DOM_Case.case.name.text(API.data.getName(patient));
        DOM_Case.case.age_gender.text(API.data.getAgeGender(patient));
        DOM_Case.case.well.text(API.data.getLastWell(patient));
        DOM_Case.case.time.text(API.data.getStatusTime(patient));

        DOM_Case.case.patient.removeClass("incoming active completed");
        switch (patient.status) {
            case "incoming":
                DOM_Case.case.patient.addClass("incoming");
                DOM_Case.case.status.text("Incoming");
                break;
            case "active":
                DOM_Case.case.patient.addClass("active");
                DOM_Case.case.status.text("Active");
                break;
            case "completed":
                DOM_Case.case.patient.addClass("completed");
                DOM_Case.case.status.text("Completed");
                break;
        }
    },
    fillPage: function(data) {
        console.log(data);
        this.section_data = data;
        DOM_Case.case["main"].html("");

        DOM_Case.case["main"].load(`${Case.section}.html`, function() {
            //Make UI inputs work
            $(document).trigger("case:refresh");

            $.each(data, function(key, value) {
                Case.setInput(key, value);
            });

            Case.overlay.hideTimer();
        });

    },
    loadPageLoader: function() {
        DOM_Case.case["btns"].click(function() {
            let button = $(this);

            if (button.hasClass("selected")) {
                return;
            }

            if (Case.overlay.dialog_active) {
                return;
            }

            if (!Case.section_data) {
                Case.loadPage(button);
                return;
            }

            //Check if you haven't changed any fields
            let data = {};
            data.case_id = Case.case_id;
            $(DOM_Case.case.inputs).each(function() {
                Case.getInput($(this), data);
            });
            let differences = [];
            let i = 0, extras = 0;
            $.each(data, function(key, value) {
                if (Case.section_data[key] != data[key]) {
                    i++;
                    if (i < 9) {
                        differences.push(key);
                    } else {
                        extras++;
                    }
                } else {

                }
            })
            if (extras > 0) {
                differences.push(`and ${extras} more field${extras > 1 ? "s" : ""}.`)
            }

            if (differences.length > 0) {
                Case.overlay.showDialog({
                    header: "warning",
                    text: `There are unsubmitted changes to the following fields:
                    <code>${differences.join("</br>")}</code>
                    Are you sure you want to change pages?`,
                    buttons: [
                        {
                            text: "Discard",
                            style: "neutral",
                            click: function() {
                                Case.loadPage(button);
                            }
                        },
                        {
                            text: "Submit",
                            style: "yes",
                            click: function() {
                                Case.submitPage();
                            }
                        },
                        {
                            text: "Cancel",
                            style: "no",
                            click: function() {
                                Case.overlay.hideDialog();
                            }
                        }
                    ]
                });
            } else {
                Case.loadPage(button);
            }

        });

        $("div[data-section='case_eds']").trigger("click");
    },
    loadPage: function(button) {
        Case.overlay.hideDialog();
        Case.overlay.showTimer();

        let section = button.data("section");

        API.get(section, Case.case_id, function(data) {
            Case.section = section;

            Case.fillPage(data);

            //Change the selected button
            button.siblings(".js-case-button").removeClass("selected");
            button.addClass("selected");
        });
    },
    setInput: function(name, value) {
        let input = $("#db-" + name);

        if (Case.section == "case_eds") {
            if (name == "location") {
                $(DOM_Case.ed.loc).children("span").text(value);
            } else {
                if (value == 1) {
                    input.closest("div").addClass(DOM_Case.ed.complete);
                    input.prop("checked", true);
                }
            }
            return;
        }

        if (Case.section == "case_managements") {
            switch (name) {
                case "dob":
                case "large_vessel_occlusion":
                case "last_well":
                case "ich_found":
                    if (value == null) {
                        input.addClass("-ui-toggle-unknown");
                        input.text("Unknown");
                        return;
                    }
            }

            switch (name) {
                case "dob":
                    console.log(`Age: ${API.data.getAge(value)}`);
                    if (API.data.getAge({dob: value}) > 18) {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                    } else {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                    }
                    break;
                case "large_vessel_occlusion":
                    console.log(`LVO: ${value}`);
                    if (value) {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                    } else {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                    }
                    break;
                case "last_well":
                    let time = API.data.extractTime(new Date().getTime() - new Date(value).getTime());
                    console.log(`LVO: ${time.hour}h ${time.minute}m`);
                    if (time.hour > 3 && time.minute > 29) {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                    } else {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                    }
                    break;
                case "ich_found":
                    console.log(`ICH: ${value}`);
                    if (value) {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                    } else {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                    }
                    break;
            }
        }

        if (input.hasClass("-ui-since") || input.hasClass("-ui-toggle") || input.hasClass("-ui-select")) {
            input.trigger("ui:set", value);

            return;
        }

        if (input.prop("type") == "date") {
            input.val(value);
            input.removeClass("empty");
            return;
        }

        input.val(value);

    },
    getInput: function(element, data) {
        let key = element.attr("id").slice(3);

        if (Case.section == "case_eds") {
            if (key == "location") {
                let text = $(DOM_Case.ed.loc).children("span").html();
                text = (text == "") ? null : text;
                if (element.val()) {
                    data[key] = element.val();
                } else {
                    data[key] = text;
                }
            } else {
                if (element.is(":checked")) {
                    data[key] = 1;
                } else {
                    data[key] = 0;
                }

            }
            return;
        }

        if (element.hasClass("-ui-since") || element.hasClass("-ui-toggle") || element.hasClass("-ui-select")) {
            let obj = {
                val: null
            };
            element.trigger("ui:get", obj);
            data[key] = obj.val;
            return;
        }

        if (element.prop("type") == "date") {
            data[key] = API.data.convertDate(new Date(element.val()));

            return;
        }

        if (element.val() || element.val() === 0) {
            data[key] = element.val();
        } else {
            data[key] = null;
        }

    },
    overlay: {
        showTimer() {
            DOM_Case.case.overlay.removeClass("hidden");
            DOM_Case.case.timer.removeClass("hidden");
        },
        hideTimer() {
            DOM_Case.case.overlay.addClass("hidden");
            DOM_Case.case.timer.addClass("hidden");
        },
        dialog_active: false,
        showDialog(settings) {
            this.dialog_active = true;
            DOM_Case.case.overlay.removeClass("hidden");

            let header = DOM_Case.case.dialog.find("header");
            header.empty();
            header.removeClass();
            switch (settings.header) {
                case "error":
                case "warning":
                    header.addClass("warning");
                    header.html(`
                        <img src="/icons/button/warning.png" />
                        <span>Warning</span>
                        `);
                    break;
            }

            let main = DOM_Case.case.dialog.find("main");
            main.empty();
            main.html(settings.text);

            let buttons = DOM_Case.case.dialog.find("aside");
            buttons.empty();
            $.each(settings.buttons, function(index, option) {
                let button = $(`<button>${option.text}</button>`);
                button.addClass(option.style);
                button.on("click", option.click);

                buttons.append(button);
            });

            DOM_Case.case.dialog.fadeIn({
                duration: 250
            });
            DOM_Case.case.dialog.removeClass("hidden");
        },
        hideDialog() {
            this.dialog_active = false;
            DOM_Case.case.dialog.fadeOut();
            DOM_Case.case.dialog.addClass("hidden");
            DOM_Case.case.overlay.addClass("hidden");
        }
    }
};

const History = {
    load: function() {
        $("body").on("click", DOM_Case.history["anticoags"], function() {
            let obj = {val: null};
            $(this).trigger("ui:get", obj);
            if (obj.val == "yes") {
                $(DOM_Case.history["last_dose"]).removeClass("hidden");
            } else {
                $(DOM_Case.history["last_dose"]).addClass("hidden");
            }
        });
    }
}

const Assess = {
    load: function() {
        $("body").on("click", DOM_Case.assess["btns"], function() {
            let loc = $(this).data("anchor");
            let val = $(DOM_Case.assess[loc]).offset().top - $(DOM_Case.assess["section"]).offset().top + $(DOM_Case.assess["section"]).scrollTop();

            $(DOM_Case.assess["section"]).animate({
                scrollTop: val
            }, {
                duration: 500,
                easing: "swing"
            })

        });

        //Load score calculations
        $("body").on("ui:select", DOM_Case.assess["section"] + " .-ui-select", function() {
            Assess.calcScore("race", "race_score");
            Assess.calcScore("nihss", "nihss_score");
            Assess.calcScore("mrs", "mrs_score");
        });
    },
    calcScore: function(container_name, score_name) {
        let score = 0;
        $(DOM_Case.assess[container_name]).find("input").each(function(){
            //Don't add Toggle inputs
            if (!$(this).parent().hasClass("-ui-select")) {
                return;
            }

            score += parseInt($(this).val());

        });

        //Print out
        if (score) {
            $(DOM_Case.assess[score_name]).text(score);
            $(DOM_Case.assess[score_name]).removeClass("empty");
        } else {
            $(DOM_Case.assess[score_name]).text("??");
            $(DOM_Case.assess[score_name]).addClass("empty");
        }
    }
};

const Radiology = {
    load: function() {
        //Go down the progress pathway
        //TODO: Do this smarter?
        $("body").on("ui:toggle", DOM_Case.radiology["progress"] + " .-ui-toggle", function() {
            let progress = 0;

            while (true) {
                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-0", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-1", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-2", "0")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-3", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-4", "1")) {
                    progress++;
                } else {
                    break;
                }

                break;
            }

            for (let i = 0; i < 6; i++) {
                if (i <= progress) {
                    $(DOM_Case.radiology["progress"] + "-" + i).removeClass("hidden");
                } else {
                    $(DOM_Case.radiology["progress"] + "-" + i).addClass("hidden");
                    $(DOM_Case.radiology["progress"] + "-" + i).find(".-ui-toggle").trigger("ui:clear");
                }
            }
        });

        //Ensure the proper progress is loaded when the page is loaded
        $(document).on("case:refresh", function() {
            $(DOM_Case.radiology["progress"] + "-0").trigger("ui:toggle");
        });
    },
    checkProgress: function(id, wanted) {
        let input = $(id).find("input");
        if (input.val() == wanted) {
            return true;
        } else {
            return false;
        }
    }
};


/************
 * ON READY *
 ************/

$(document).ready(function() {
    DOM_Case.load();

    Case.load();
    History.load();
    Assess.load();
    Radiology.load();

});

/*******************
 *  MISC FUNCTIONS *
 *******************/
