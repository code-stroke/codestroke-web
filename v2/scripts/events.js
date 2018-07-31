const Events = {
    DOM: {
        main: "#js-events-main",
        row: ".events-row",
        data: ".events-data",
        button_down: ".events-button-down",
        button_go: ".events-button-go",
        overlay: "#js-overlay",
        overlay_timer: "#js-overlay-timer"
    },
    template: {
        row: ({ case_id, status, name, age_gender, role, clinician, action_type, action, time }) => `
            <div class="events-row ${status}" title="Show More...">
                <div class="events-row-box patient">
                    <span>${name}</span>
                </div>
                <div class="events-row-box patient_age">
                    ${age_gender}
                </div>
                <div class="events-row-spacer"></div>
                <div class="events-row-box clinician_icon">
                    <img src="icons/staff/${role}.png"/>
                </div>
                <div class="events-row-box clinician">
                    <span>${clinician}</span>
                </div>
                <div class="events-row-spacer"></div>
                <div class="events-row-box action_icon">
                    <img src="icons/action/${action_type}.png"/>
                </div>
                <div class="events-row-box action">
                    ${action}
                </div>
                <div class="events-row-spacer blank"></div>
                <div class="events-row-box time">
                    ${time}
                </div>
                <div class="events-row-spacer blank"></div>
                <div class="events-row-box buttons">
                    <button class="events-button-down" >
                        <img src="icons/button/down.png"/>
                    </button>
                    <button class="events-button-go" title="Edit Case">
                        <img src="icons/button/log.png"/>
                    </button>
                </div>
            </div>
        `,
        data_row: `<div class="events-data"></div>`,
        item: ({ key, value }) => `
            <div class="events-data-item">
                <strong>${key}:</strong> <span>${value}<span>
            </div>
        `,
    },
    data: {},
    load: function() {
        Events.overlay.showTimer();
        API.events(function(result) {
            if (result) {
                console.log(result);
                Events.data = result;
            }

            $(Events.DOM.main).empty();

            $.each(Events.data, function(index, value) {
                let meta = JSON.parse(value.event_metadata);
                let obj = {};
                obj.case_id = meta.case_id;
                obj.status = meta.status;
                obj.name = API.data.getName(meta);
                obj.age_gender = API.data.getAgeGender(meta);

                obj.role = value.signoff_role;
                if (value.signoff_first_name && value.signoff_last_name) {
                    obj.clinician = value.signoff_first_name + " " + value.signoff_last_name;
                } else {
                    obj.clinician = "Unknown";
                }


                switch (value.event_type) {
                    case "add":
                        obj.action_type = "add-patient";
                        obj.action = "Add Patient";
                        break;
                    case "edit":
                        obj.action_type = "edit-patient";
                        obj.action = "Edit " + Events.utility.getSectionName(meta.info_table);
                        break;
                }

                let millis = new Date().getTime() - new Date(value.event_timestamp);
                obj.time = API.data.extractTimeString(millis) + " ago";

                let row = $(Events.template.row(obj));
                row.data("case_id", obj.case_id);
                row.data("index", index);
                row.data("status", obj.status);
                $(Events.DOM.main).append(row);
            });

            Events.overlay.hideTimer();
        });

        this.loadButtons();

    },
    loadButtons() {
        // #1 The Functionality
        $("body").on({
            click: function() {
                if (!$(this).is(".open")) {
                    // #1 Reset previous row
                    let prev = $(this).siblings(Events.DOM.row + ".open");
                    prev.find(Events.DOM.button_down).html(`<img src="icons/button/down.png"/>`);
                    prev.removeClass("open");
                    $(this).siblings(Events.DOM.data).remove();

                    // #2 Open current row
                    $(this).find(Events.DOM.button_down).html(`<img src="icons/button/up.png"/>`);
                    $(this).addClass("open");

                    // #3 Add the Data row with all the items
                    let event = JSON.parse(Events.data[$(this).data("index")].event_data);
                    let row = $(Events.template.data_row);
                    row.addClass($(this).data("status"));
                    $.each(event, function(key, value) {
                        row.append(Events.template.item({key: Events.utility.prettifyString(key), value: value}));
                    });
                    $(this).after(row);
                } else {
                    // Reset current row
                    $(this).find(Events.DOM.button_down).html(`<img src="icons/button/down.png"/>`);
                    $(this).removeClass("open");
                    $(this).siblings(Events.DOM.data).remove();
                }

            }
        }, Events.DOM.row);

        $("body").on({
            click: function (event) {
                event.stopPropagation();
                let id = $(this).closest(Events.DOM.row).data("case_id");
                window.location.href = `./case.html?case_id=${id}`;
            }
        }, Events.DOM.button_go);

        // #2 The Aesthetics
        $("body").on({
            mouseenter: function () {
                $(this).addClass("highlight");
                $(this).find(Events.DOM.button_down).addClass("highlight");
            },
            mouseleave: function () {
                $(this).removeClass("highlight");
                $(this).find(Events.DOM.button_down).removeClass("highlight");
            }
        }, Events.DOM.row);

        $("body").on({
            mouseenter: function (event) {
                event.stopPropagation();
                $(this).addClass("highlight");
                $(this).parent().removeClass("highlight");
                $(this).siblings(Events.DOM.button_down).removeClass("highlight");
                $(this).parent().trigger("mouseleave");
            },
            mouseleave: function (event) {
                $(this).removeClass("highlight");
            }
        }, Events.DOM.button_go);

        $("body").on({
            mouseenter: function (event) {
                $(this).parent().trigger("mouseenter");
            },
            mouseleave: function (event) {
            }
        }, Events.DOM.button_down);
    },
    utility: {
        getSectionName(table_name) {
            switch (table_name) {
                case "cases":
                    return "Patient Details";
                case "case_eds":
                    return "ED Triage";
                case "case_histories":
                    return "Case History";
                case "case_assessments":
                    return "Assessment";
                case "case_radiologies":
                    return "Radiology Progress";
                case "case_managements":
                    return "Management";
                default:
                    return "Other";
            }
        },
        prettifyString(key) {
            if (key.length < 4) {
                return key.toUpperCase();
            }

            var parts = key.split("_");
            for (let i = 0; i < parts.length; i++) {
                parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
            }
            return parts.join(" ");
        }
    }, overlay: {
        showTimer() {
            this.loading = true;
            $(Events.DOM.overlay).removeClass("hidden");
            $(Events.DOM.overlay_timer).removeClass("hidden");
        },
        hideTimer() {
            this.loading = false;
            $(Events.DOM.overlay).addClass("hidden");
            $(Events.DOM.overlay_timer).addClass("hidden");
        },
        loading: false
    }
}

$(document).ready(function() {
    Events.load();
});
