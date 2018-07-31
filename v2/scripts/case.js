const Case = {
    DOM: {
        sidebar: "#js-sidebar",
        btns: ".js-case-button",
        main: "#js-case-main",

        overlay: "#js-case-overlay",
        timer: "#js-case-timer",
        dialog: "#js-case-dialog",

        inputs: ".case-input",
        submits: ".case-submit",

        patient: "#js-patient",
        name: "#js-patient-name",
        age_gender: "#js-patient-age_gender",
        status: "#js-patient-status",
        time: "#js-patient-time",
        well: "#js-patient-well"
    },
    case_id: null,
    section: "",
    section_data: null,
    patient: null,
    load: function() {
        Case.case_id = new URL(window.location.href).searchParams.get("case_id");

        if (!Case.case_id) {
            window.location.href = "/index.html";
        } else {
            Case.case_id = parseInt(Case.case_id);
            API.get("cases", Case.case_id, Case.fillPatient);
        }

        Case.loadPageLoader();
        Case.loadSubmit();
    },
    loadSubmit: function() {
        $("body").on("click", Case.DOM.submits, function() {

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
    submitPage: function(callback) {
        Case.overlay.hideDialog();
        Case.overlay.showTimer();

        let data = {};
        data.case_id =  Case.case_id;

        $(Case.DOM.inputs).each(function() {
            if (CHANGE.hasChanged($(this))) {
                Case.getInput($(this), data);
            }
        });

        console.log(data);

        API.put(Case.section, Case.case_id, data, function(result) {
            console.log(result);

            API.get(Case.section, Case.case_id, function(info) {
                Case.fillPage(info);
                if (Case.section == "cases") {
                    Case.fillPatient(info);
                }
                if (callback) {
                    callback();
                }
            });
        });
    },
    fillPatient: function(patient) {
        if (!patient) {
            window.location.href = "/index.html";
        }

        Case.patient = patient;

        $(Case.DOM.name).text(API.data.getName(patient));
        $(Case.DOM.age_gender).text(API.data.getAgeGender(patient));
        $(Case.DOM.well).text(API.data.getLastWell(patient));
        $(Case.DOM.time).text(API.data.getStatusTime(patient));

        $(Case.DOM.patient).removeClass("incoming active completed");
        switch (patient.status) {
            case "incoming":
                $(Case.DOM.patient).addClass("incoming");
                $(Case.DOM.status).text("Incoming");
                break;
            case "active":
                $(Case.DOM.patient).addClass("active");
                $(Case.DOM.status).text("Active");
                break;
            case "completed":
                $(Case.DOM.patient).addClass("completed");
                $(Case.DOM.status).text("Completed");
                break;
        }
    },
    fillPage: function(data) {
        console.log(data);
        this.section_data = data;
        $(Case.DOM.main).empty;

        $(Case.DOM.main).load(`${Case.section}.html`, function() {
            //Make UI inputs work
            $(document).trigger("case:load_start");

            $.each(data, function(key, value) {
                Case.setInput(key, value);
            });

            Case.overlay.hideTimer();

            $(document).trigger("case:load_end");
        });

    },
    loadPageLoader: function() {
        $(Case.DOM.sidebar).find(Case.DOM.btns).click(function() {
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

            let differences = [];
            let i = 0, extras = 0;
            $(Case.DOM.main).find(Case.DOM.inputs).each(function() {
                if (CHANGE.hasChanged($(this))) {
                    i++;
                    if (i < 9) {
                        differences.push($(this).attr("id").slice(3));
                    } else {
                        extras++;
                    }
                }
            });

            if (extras > 0) {
                differences.push(`</br>...and ${extras} more field${extras > 1 ? "s" : ""}.`)
            }

            if (differences.length > 0) {
                Case.overlay.showDialog({
                    header: "warning",
                    text: `There are unsubmitted changes to the following fields:</br>
                    <code>${differences.join("</br>")}</code></br>
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
                $(Ed.DOM.loc).children("span").text(value);
                input.trigger("ui:load", "");
            } else {
                if (value == 1) {
                    input.closest("div").addClass(Ed.DOM.complete);
                    input.prop("checked", true);
                } else {
                    input.trigger("ui:load", value);
                    input.trigger("ui:set", value);
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
                default:
                     break;
            }

            switch (name) {
                case "dob":
                    console.log(`Age: ${API.data.getAge(value)}`);
                    if (API.data.getAge({dob: value}) > 18) {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                        input.val(1);
                    } else {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                        input.val(0);
                    }
                    return;
                case "large_vessel_occlusion":
                    console.log(`LVO: ${value}`);
                    if (value) {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                        input.val(1);
                    } else {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                        input.val(0);
                    }
                    return;
                case "last_well":
                    let time = API.data.extractTime(new Date().getTime() - new Date(value).getTime());
                    console.log(`LVO: ${time.hour}h ${time.minute}m`);
                    if ((time.hour > 3 && time.minute > 29) || time.hour > 4) {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                        input.val(0);
                    } else {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                        input.val(1);
                    }
                    return;
                case "ich_found":
                    console.log(`ICH: ${value}`);
                    if (value) {
                        input.addClass("-ui-toggle-no");
                        input.text("No");
                        input.val(0);
                    } else {
                        input.addClass("-ui-toggle-yes");
                        input.text("Yes");
                        input.val(1);
                    }
                    return;
                default:
                    break;
            }
        }

        input.trigger("ui:load", value);
        input.trigger("ui:set", value);

    },
    getInput: function(element, data) {
        let key = element.attr("id").slice(3);

        if (Case.section == "case_managements") {
            switch (key) {
                case "dob":
                case "large_vessel_occlusion":
                case "last_well":
                case "ich_found":
                    data[key] = Case.section_data[key];
                    return;
                default:
                    break;
            }
        }

        let obj = {
            val: null
        };
        element.trigger("ui:get", obj);
        data[key] = obj.val;

    },
    overlay: {
        showTimer() {
            this.loading = true;
            $(Case.DOM.overlay).removeClass("hidden");
            $(Case.DOM.timer).removeClass("hidden");
        },
        hideTimer() {
            this.loading = false;
            $(Case.DOM.overlay).addClass("hidden");
            $(Case.DOM.timer).addClass("hidden");
        },
        loading: false,
        dialog_active: false,
        showDialog(settings) {
            this.dialog_active = true;
            $(Case.DOM.overlay).removeClass("hidden");

            let header = $(Case.DOM.dialog).find("header");
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

            let main = $(Case.DOM.dialog).find("main");
            main.empty();
            main.html(settings.text);

            let buttons = $(Case.DOM.dialog).find("aside");
            buttons.empty();
            $.each(settings.buttons, function(index, option) {
                let button = $(`<button>${option.text}</button>`);
                button.addClass(option.style);
                button.on("click", option.click);

                buttons.append(button);
            });

            $(Case.DOM.dialog).fadeIn({duration: 250}).removeClass("hidden");
        },
        hideDialog() {
            this.dialog_active = false;
            $(Case.DOM.dialog).fadeOut().addClass("hidden");
            $(Case.DOM.overlay).addClass("hidden");
        }
    }
};

const Ed = {
    DOM: {
        loc: "#js-ed-loc",
        complete: "ed_complete"
    },
    load() {

    }
}

const History = {
    DOM: {
        anticoags: "#db-anticoags",
        last_dose: "#js-history-last_dose"
    },
    load: function() {
        $("body").on("ui:toggle", History.DOM.anticoags, function() {
            let obj = {val: null};
            $(this).trigger("ui:get", obj);
            if (obj.val == "yes") {
                $(History.DOM.last_dose).removeClass("hidden");
            } else {
                $(History.DOM.last_dose).addClass("hidden");
            }
        });

        $(document).on("case:load_end", function() {
            $(History.DOM.anticoags).trigger("ui:toggle");
        });
    }
}

const Assess = {
    DOM: {
        btns: ".js-assess-button",
        section: "#js-assess-section",
        mass: "#js-assess-mass",
        vitals: "#js-assess-vitals",
        race: "#js-assess-race",
        race_score: "#js-assess-race-score",
        cannula: "#js-assess-cannula",
        nihss: "#js-assess-nihss",
        nihss_score: "#js-assess-nihss-score",
        mrs: "#js-assess-mrs",
        mrs_score: "#js-assess-mrs-score",
        lvo: "#js-assess-lvo",
        lvo_input: "#db-likely_lvo",
        lvo_button: "#js-assess-lvo-button",
        submit: "#js-assess-submit"
    },
    load: function() {
        //Load Scrolling
        $("body").on("click", Assess.DOM.btns, function() {
            let loc = $(this).data("anchor");
            let val = $(Assess.DOM[loc]).offset().top - $(Assess.DOM.section).offset().top + $(Assess.DOM.section).scrollTop();

            $(Assess.DOM.section).animate({
                scrollTop: val
            }, {
                duration: 500,
                easing: "swing"
            })

        });

        //Load score calculations
        $("body").on("ui:select", Assess.DOM.section + " .-ui-select", function() {
            Assess.calcScore("race", "race_score");
            Assess.calcScore("nihss", "nihss_score");
            Assess.calcScore("mrs", "mrs_score");
        });

        //Load likely LVO status
        $(document).on("case:load_end", function() {
            if ($(Assess.DOM.lvo_input).val() == "1") {
                $(Assess.DOM.lvo).addClass("hidden");
            } else {
                $(Assess.DOM.lvo).removeClass("hidden");
            }
        });

        $("body").on("click", Assess.DOM.lvo_button, function() {
            Case.overlay.showDialog({
                header: `caution`,
                text: `Are you sure you want to notify staff about a potential LVO?`,
                buttons: [

                    {
                        text: "Continue",
                        style: "yes",
                        click: function() {
                            $(Assess.DOM.lvo_input).val(1);
                            $(Assess.DOM.lvo_input).trigger("change");
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


            $(Assess.DOM.lvo_input).val(1);

        });
    },
    calcScore: function(container_name, score_name) {
        let score = 0;
        $(Assess.DOM[container_name]).find("input").each(function(){
            //Don't add Toggle inputs
            if (!$(this).parent().hasClass("-ui-select")) {
                return;
            }

            score += parseInt($(this).val());

        });

        //Print out
        if (score || score === 0) {
            $(Assess.DOM[score_name]).text(score);
            $(Assess.DOM[score_name]).removeClass("empty");
        } else {
            $(Assess.DOM[score_name]).text("??");
            $(Assess.DOM[score_name]).addClass("empty");
        }
    }
};

const Radiology = {
    DOM: {
        progress: "#js-radiology-progress"
    },
    load: function() {
        //Go down the progress pathway
        //TODO: Do this smarter?
        $("body").on("ui:toggle", Radiology.DOM.progress + " .-ui-toggle", function() {
            if (Case.overlay.loading) {
                return;
            }

            let progress = 0;

            while (true) {
                if (Radiology.checkProgress(Radiology.DOM.progress + "-0", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(Radiology.DOM.progress + "-1", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(Radiology.DOM.progress + "-2", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(Radiology.DOM.progress + "-3", "0")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(Radiology.DOM.progress + "-4", "1")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(Radiology.DOM.progress + "-5", "1")) {
                    progress++;
                } else {
                    break;
                }

                break;
            }

            for (let i = 0; i < 7; i++) {
                if (i <= progress) {
                    $(Radiology.DOM.progress + "-" + i).removeClass("hidden");
                } else {
                    $(Radiology.DOM.progress + "-" + i).addClass("hidden");
                    $(Radiology.DOM.progress + "-" + i).find("input").val("");
                    $(Radiology.DOM.progress + "-" + i).find(".-ui-toggle").trigger("ui:clear");
                }
            }
        });

        //Ensure the proper progress is loaded when the page is loaded
        $(document).on("case:load_end", function() {
            $(Radiology.DOM.progress + "-0 .-ui-toggle").trigger("ui:toggle");
        });
    },
    checkProgress: function(id, wanted) {
        let input = $(id).find(".-ui-toggle");
        let obj = {
            val: null
        };
        input.trigger("ui:get", obj);
        if (obj.val == wanted) {
            return true;
        } else {
            return false;
        }
    }
};

const Manage = {
    DOM: {
        thrombolysis: "#db-thrombolysis",
        eligibility: "#js-manage-eligibility",
        absolute: "#js-manage-absolute",
        relative: "#js-manage-relative",
        time: "#js-manage-time",

        time_button: "#js-manage-time-button",
        time_given: "#js-manage-time-given",
        time_input: "#db-thrombolysis_time_given",

        complete_row: "#js-manage-complete",
        complete_button: "#js-manage-complete-button"
    },
    load: function() {
        $("body").on("ui:toggle", Manage.DOM.thrombolysis, function() {
            let obj = {val: null};
            $(this).trigger("ui:get", obj);
            if (obj.val == "1") {
                $(Manage.DOM.eligibility).removeClass("hidden");
                $(Manage.DOM.absolute).removeClass("hidden");
                $(Manage.DOM.relative).removeClass("hidden");
                $(Manage.DOM.time).removeClass("hidden");
            } else {
                $(Manage.DOM.eligibility).addClass("hidden");
                $(Manage.DOM.absolute).addClass("hidden");
                $(Manage.DOM.relative).addClass("hidden");
                $(Manage.DOM.time).addClass("hidden");
            }
        });

        $(document).on("case:load_end", function() {
            $(Manage.DOM.thrombolysis).trigger("ui:toggle");
        });

        $(document).on("case:load_end", function() {
            let obj = {val: null};
            $(Manage.DOM.time_input).trigger("ui:get", obj);

            if (obj.val) {
                $(Manage.DOM.time_given).removeClass("hidden");
                $(Manage.DOM.time_button).addClass("hidden");
            } else {
                $(Manage.DOM.time_given).addClass("hidden");
                $(Manage.DOM.time_button).removeClass("hidden");
            }
        });

        $("body").on("click", Manage.DOM.time_button, function() {

            let ci = false;
            $(Case.DOM.main).find(Case.DOM.inputs).each(function() {
                let key = $(this).attr("id").slice(3);
                let element = $(this);
                //Handle special cases first
                switch (key) {
                    case "thrombolysis":
                    case "ecr":
                    case "surgical_rx":
                    case "conservative_rx":
                        return;
                    case "dob":
                    case "large_vessel_occlusion":
                    case "last_well":
                    case "ich_found":
                        if ($(this).val() == "0") {
                            ci = true;
                        }
                        return;
                    default:
                        break;
                }

                if (!element.hasClass("-ui-toggle")) {
                    return;
                }

                let obj = {
                    val: null
                };
                element.trigger("ui:get", obj);

                if (obj.val == null && key != "large_vessel_occlusion") {
                    ci = null;
                    return false;
                }

                if (obj.val == "0") {
                    ci = true;
                }
            });

            let text, header;
            switch (ci) {
                case null:
                    header = "caution";
                    text = `<code>You have not filled in all the contraindication fields.</code></br>
                            Are you sure you want to proceed with Thrombolysis?`
                    break;
                case true:
                    header = "caution";
                    text = `<code>You have contraindications to Thrombolysis.</code></br>
                            Are you sure you want to proceed with Thrombolysis?`
                    break;
                case false:
                    header = "warning";
                    text = `Are you sure you want to proceed with thrombolysis?`
                    break;
            }

            Case.overlay.showDialog({
                header: header,
                text: text,
                buttons: [

                    {
                        text: "Continue",
                        style: "yes",
                        click: function() {
                            $(Manage.DOM.time_input).trigger("ui:set", [API.data.convertDateTime(new Date()), true]);
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

        $(document).on("case:load_end", function() {
            if (Case.patient.status == "completed") {
                $(Manage.DOM.complete_row).addClass("hidden");
            } else {
                $(Manage.DOM.complete_row).removeClass("hidden");
            }
        });

        $("body").on("click", Manage.DOM.complete_button, function() {
            Case.overlay.showDialog({
                header: "caution",
                text: `You are about to submit changes and mark this case as complete. </br></br>
                        <code>This will lock the case from any further editing.</code></br>
                        Are you sure you want to continue?`,
                buttons: [

                    {
                        text: "Continue",
                        style: "yes",
                        click: function() {
                            // A little messy?
                            // 1. Submits the current data on the page (so that the case isn't locked)
                            // 2. Submits the completed status
                            // 3. Hides the Button
                            // 4. Gets the Completed Status back from the server so that the sidebar can update

                            Case.submitPage(function() {
                                Case.overlay.showTimer();
                                API.put("cases", Case.case_id, {
                                    status: "completed",
                                    completed_timestamp: API.data.convertDateTime(new Date())
                                }, function() {
                                    window.location.reload();
                                    //$(Manage.DOM.complete_row).addClass("hidden");
                                    //API.get("cases", Case.case_id, Case.fillPatient);
                                });
                            });
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

    }
}


/************
 * ON READY *
 ************/

$(document).ready(function() {
    Case.load();
    History.load();
    Assess.load();
    Radiology.load();
    Manage.load();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/
