const SELECT = {
    setup: function() {
        /* Styling and extras*/
        $(".-ui-select").prop("tabindex", "-1");
        $(".-ui-select").addClass("empty");
        $(".-ui-select").each(function() {
            $(this).append(`<input type="hidden"/>`);
            $(this).append(`<span>Select Option</span>`);
            $(this).append(`<img src="icons/button/caret-down.png" />`);
        })

        $(".-ui-select > ul").css("min-width", "-=2px");

        $(".-ui-select li").each(function() {
            $(this).data("text", $(this).text());
            if ($(this).data("val") || $(this).data("val") == 0) {
                $(this).append(`<span>${String($(this).data("val"))}</span>`);
            }
        });

        /* Events */
        if (!SELECT.isRegistered) {
            $("body").on("focusout", ".-ui-select", function() {
                SELECT.close($(this));
            });

            $("body").on("click", ".-ui-select", function() {
                if (!$(this).data("open")) {
                    SELECT.open($(this));
                } else {
                    SELECT.close($(this));
                }
            });

            $("body").on("click", ".-ui-select li", function() {
                SELECT.value($(this));
            });

            $("body").on("ui:set", ".-ui-select", function(event, value) {
                SELECT.set($(this), value);
            });

            $("body").on("ui:get", ".-ui-select", function(event, obj) {
                SELECT.get($(this), obj);
            });

            SELECT.isRegistered = true;
        }
    },
    open: function(parent) {
        parent.data("open", true);

        // Choose to open TOP or BOTTOm
        let child = parent.children("ul");
        let totalHeight = parent.offset().top + parent.outerHeight() + child.outerHeight();

        if (totalHeight > ($(window).height())) {
            child.css("top", `-${child.outerHeight() - 1}px`);

            child.css("border-radius", "5px 5px 0 0");
            parent.css("border-radius", "0 0 5px 5px");
        } else {
            child.css("top", `${parent.outerHeight() - 2}px`);

            child.css("border-radius", "0 0 5px 5px");
            parent.css("border-radius", "5px 5px 0 0");
        }

        // Display the box
        child.addClass("flex");
    },
    close: function(parent) {
        parent.data("open", false);

        let child = parent.children("ul");

        parent.css("border-radius", "5px");

        child.removeClass("flex");
    },
    value: function(child) {
        let parent = child.closest(".-ui-select");
        parent.removeClass("empty");

        parent.children("input").val(child.data("val"));
        parent.children("span").text(child.data("text"));
        parent.trigger("ui:change", child.data("val"));

        child.addClass("selected");
        child.siblings("li").removeClass("selected");

        parent.trigger("ui:select");
    },
    set: function(parent, value) {
        parent.find(`li[data-val="${value}"]`).trigger("click");
        parent.trigger("focusout");
    },
    get: function(parent, obj) {
        let val = parent.children("input").val();

        if (!val) {
            return;

        }

        if (!isNaN(val)) {
            obj.val = parseInt(val);
        } else {
            obj.val = val;
        }
    },
    isRegistered: false
}

const TOGGLE = {
    setup: function() {
        $(".-ui-toggle").each(function() {
            $(this).data("background", $(this).css("background"));
            $(this).prepend("<input type=hidden>");
            $(this).addClass("empty");
        });

        if (!TOGGLE.isRegistered) {
            $("body").on("click", ".-ui-toggle li", function() {
                TOGGLE.value($(this));
            });

            $("body").on("ui:clear", ".-ui-toggle", function() {
                TOGGLE.clear($(this));
            });

            $("body").on("ui:set", ".-ui-toggle", function(event, value) {
                TOGGLE.set($(this), value);
            });

            $("body").on("ui:get", ".-ui-toggle", function(event, obj) {
                TOGGLE.get($(this), obj);
            });

            TOGGLE.isRegistered = true;
        }
    },
    value: function(child) {
        let parent = child.closest(".-ui-toggle");
        parent.removeClass("empty");

        parent.children("input").val(child.data("val"));
        parent.trigger("ui:change", child.data("val"));

        child.addClass(child.data("class"));

        child.siblings("li").removeClass();


        parent.trigger("ui:toggle");
    },
    clear: function(parent) {
        parent.children("li").removeClass();
        parent.children("input").val("");
        parent.trigger("ui:change", "");
    },
    set: function(parent, value) {
        parent.find(`li[data-val="${value}"]`).trigger("click");
    },
    get: function(parent, obj) {
        let val = parent.children("input").val();

        if (!val) {
            return;

        }

        if (!isNaN(val)) {
            obj.val = parseInt(val);
        } else {
            obj.val = val;
        }
    },
    isRegistered: false
}

const SINCE = {
    setup: function() {
        $(".-ui-since").each(function() {
            $(this).data("state", "result");
            $(this).append(`
                <input class="hidden" type="hidden">
                <div class="-ui-since-result">
                    <span class="">Unknown</span>
                    <button class=""></button>
                </div>
                <div class="-ui-since-edit hidden">
                    <input class="" type="date">
                    <input class="" type="time">
                    <button class=""></button>
                </div>
                `);
        });

        if (!SINCE.isRegistered) {
            $("body").on("click", ".-ui-since button", function() {
                SINCE.toggle($(this));
            });

            $("body").on("change", ".-ui-since-edit input", function() {
                SINCE.update($(this));
            });

            $("body").on("ui:clear", ".-ui-since", function() {
                SINCE.clear($(this));
            });

            $("body").on("ui:set", ".-ui-since", function(event, value, noLoad) {
                SINCE.set($(this), value, noLoad);
            });

            $("body").on("ui:get", ".-ui-since", function(event, obj) {
                SINCE.get($(this), obj);
            });

            SINCE.isRegistered = true;
        }
    },
    convertTime(milliseconds) {
        var day, hour, minute, seconds;
        seconds = Math.floor(milliseconds / 1000);
        minute = Math.floor(seconds / 60);
        seconds = seconds % 60;
        hour = Math.floor(minute / 60);
        minute = minute % 60;
        //day = Math.floor(hour / 24);
        //hour = hour % 24;
        return {
            //day: day,
            hour: hour,
            minute: minute,
            seconds: seconds
        };
    },
    update: function(child) {
        let parent = child.closest(".-ui-since");
        let date = parent.find("input[type='date']").val();
        let time = parent.find("input[type='time']").val();

        if (date != "" && time != "") {
            let datetime = new Date(date + " " + time);
            parent.children("input").val(datetime.toString());
            parent.trigger("ui:change", datetime.toString());
            parent.removeClass("invalid");
        } else {
            parent.children("input").val("");
            parent.trigger("ui:change", "");
            parent.addClass("invalid");
            parent.find("span").html("Unknown");
        }
    },
    toggle: function(child) {
        let parent = child.closest(".-ui-since");
        if (parent.data("state") == "result") {
            parent.find(".-ui-since-result").addClass("hidden");
            parent.find(".-ui-since-edit").removeClass("hidden");
            parent.data("state", "edit");
        } else {
            let date = parent.find("input[type='date']").val();
            let time = parent.find("input[type='time']").val();

            //If input is valid, calculate time since, else display 'unknown'
            if (date != "" && time != "") {
                let datetime = new Date(date + " " + time);

                let since = new Date().getTime() - datetime.getTime();
                let obj = SINCE.convertTime(since);
                //Only display hours if it's been >1hr since event
                if (obj.hour > 0) {
                    parent.find("span").html(`${obj.hour}h ${obj.minute}m ago`);
                } else {
                    parent.find("span").html(`${obj.minute}m ago`);
                }
            }

            parent.find(".-ui-since-edit").addClass("hidden");
            parent.find(".-ui-since-result").removeClass("hidden");
            parent.data("state", "result");
        }
    },
    clear: function(parent) {
        parent.find("input").val("");
        parent.trigger("ui:change", "");
        parent.find("span").html("Unknown");
    },
    set: function(parent, value, noLoad) {
        if (!value) {
            return;
        }

        parent.children("input").val(new Date(value).toString());
        if (noLoad) {
            parent.trigger("ui:change", new Date(value).toString());
        } else {
            parent.trigger("ui:load", new Date(value).toString());
        }

        let currentDate = value.split(" ")[0];
        let currentTime = value.split(" ")[1];

        parent.find("input[type='date']").val(currentDate);
        parent.find("input[type='time']").val(currentTime);
        //.val(dt.toLocaleTimeString());
        //parent.data("state", "edit");
        parent.find("button").trigger("click");
    },
    get: function(parent, obj) {
        let date = parent.children("input").val();

        if (date) {
            obj.val = API.data.convertDateTime(new Date(date));
        }
    },
    isRegistered: false
};

const CHANGE = {
    registered: false,
    setup: function() {
        $(".-ui-change").each(function() {
            $(this).data("hasChanged", false);
        });

        if (!CHANGE.isRegistered) {
            $("body").on("change", ".-ui-change", function(event) {
                //Do nothing if .-ui-change was not directly edited
                if(event.target !== event.currentTarget) {
                    return;
                }

                if ($(this).is(":checkbox")) {
                    $(this).val($(this).is(":checked") ? 1 : 0);
                }

                $(this).trigger("ui:change", $(this).val());
            });

            $("body").on("ui:change", ".-ui-change", function(event, value) {
                CHANGE.change($(this), value);
            });

            $("body").on("ui:load", ".-ui-change", function(event, value) {
                CHANGE.load($(this), value);
            });

            CHANGE.isRegistered = true;
        }
    },
    load: function(parent, value) {
        if (value == null) {
            parent.data("initial", "");
        } else {
            parent.data("initial", value.toString());
        }
    },
    change: function(parent, value) {
        value = value.toString();
        if (parent.data("initial") === value) {
            parent.data("hasChanged", false);
            parent.removeClass("ui_changed");
        } else {
            parent.data("hasChanged", true);
            parent.addClass("ui_changed");
        }
    },
    hasChanged: function(parent) {
        return parent.data("hasChanged");
    }
}

/* Gives extra control over Normal Inputs */
const INPUT = {
    registered: false,
    setup: function() {
        $(".-ui-input").each(function() {

        });

        if (!INPUT.isRegistered) {
            $("body").on("ui:clear", ".-ui-input", function() {
                INPUT.clear($(this));
            });

            $("body").on("ui:set", ".-ui-input", function(event, value) {
                INPUT.set($(this), value);
            });

            $("body").on("ui:get", ".-ui-input", function(event, obj) {
                INPUT.get($(this), obj);
            });

            INPUT.isRegistered = true;
        }
    },
    clear: function(parent) {
        parent.val("");
    },
    set: function(parent, value) {
        parent.val(value);
    },
    get: function(parent, obj) {
        if (parent.val() === "") {
            return null;
        }

        switch(parent.data("type")) {
            case "int":
                obj.val = parseInt(parent.val());
                break;
            case "float":
                obj.val = parseFloat(parent.val());
                break;
            case "date":
                obj.val = API.data.convertDate(new Date(parent.val()));
                break;
            case "check":
                obj.val = parent.is(":checked") ? 1 : 0;
                break;
            default:
                obj.val = parent.val();
        }

    }
}

/*const ONCE = {
    registered: false,
    setup: function() {
        $(".-ui-once").each(function() {

        });

        if (!ONCE.isRegistered) {
            $("body").on("ui:clear", ".-ui-once", function() {
                INPUT.clear($(this));
            });

            $("body").on("ui:set", ".-ui-once", function(event, value) {
                ONCE.set($(this), value);
            });

            $("body").on("ui:get", ".-ui-once", function(event, obj) {
                ONCE.get($(this), obj);
            });

            ONCE.isRegistered = true;
        }
    },
    clear: function(parent) {
        parent.val("");
    },
    set: function(parent, value) {
        parent.val(value);
    },
    get: function(parent, obj) {
        if (parent.val() === "") {
            return null;
        }

        switch(parent.data("type")) {
            case "int":
                obj.val = parseInt(parent.val());
                break;
            case "float":
                obj.val = parseFloat(parent.val());
                break;
            case "date":
                obj.val = API.data.convertDate(new Date(parent.val()));
                break;
            default:
                obj.val = parent.val();
        }

    }
}*/

function refreshUI() {
    SELECT.setup();

    TOGGLE.setup();

    SINCE.setup();

    CHANGE.setup();

    INPUT.setup();
}

$(document).ready(function() {
    refreshUI();

    $(document).on("case:load_start", function() {
        refreshUI();
    });
});
