const SELECT = {
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

        child.addClass("selected");
        child.siblings("li").removeClass("selected");

        parent.trigger("ui:select");
    },
    isRegistered: false
}

function setUpSelect() {
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

        SELECT.isRegistered = true;
    }
}

const TOGGLE = {
    value: function(child) {
        let parent = child.closest(".-ui-toggle");
        parent.removeClass("empty");

        parent.children("input").val(child.data("val"));

        child.addClass(child.data("class"));

        child.siblings("li").removeClass();

        parent.trigger("ui:toggle");
    },
    clear: function(parent) {
        parent.children("li").removeClass();
        parent.children("input").val("");
    },
    isRegistered: false
}

function setUpToggle() {
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
            console.log("CLEAR");
            TOGGLE.clear($(this));
        });

        TOGGLE.isRegistered = true;
    }
}

function refreshUI() {
    setUpSelect();

    setUpToggle();
}

$(document).ready(function() {
    refreshUI();

    $(document).on("case:refresh", function() {
        refreshUI();
    });
});
