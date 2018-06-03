const DOM_Case = {};

const DOM_Assess = {};

function loadPageLoader() {
    DOM_Case["btns"].click(function() {
        if ($(this).hasClass("selected")) {
            return;
        }

        //Change the page
        DOM_Case["main"].html("");
        DOM_Case["main"].load(`case-${$(this).data("section")}.html`, function() {
            //Make UI inputs work
            $(document).trigger("case:refresh");
        });


        //Change the selected button
        $(this).siblings(".js-case-button").removeClass("selected");
        $(this).addClass("selected");
    });

    $("div[data-section='ed']").trigger("click");
}

function loadInputs() {
    $(".js-input").change(function() {
        if ($(".js-input").val() != "") {
            $(".js-input").addClass("active");
        } else {
            $(".js-input").removeClass("active");
        }
    })
}

function loadAssessLinks() {
    $("body").on("click", DOM_Assess["btns"], function() {
        let loc = $(this).data("anchor");
        let val = $(DOM_Assess[loc]).offset().top - $(DOM_Assess["section"]).offset().top + $(DOM_Assess["section"]).scrollTop();

        $(DOM_Assess["section"]).animate({
            scrollTop: val
        }, {
            duration: 500,
            easing: "swing"
        })

    });
}

function loadDOM() {
    let assess = {
        btns: ".js-assess-button",
        section: "#js-assess-section",
        mass: "#js-assess-mass",
        vitals: "#js-assess-vitals",
        race: "#js-assess-race",
        cannula: "#js-assess-cannula",
        nihss: "#js-assess-nihss",
        mrs: "#js-assess-mrs",
        submit: "#js-assess-submit"
    }
    $.extend(DOM_Assess, assess);

    let cased = {
        btns: $(".js-case-button"),
        main: $("#js-case-main")
    }
    $.extend(DOM_Case, cased);
}

/************
 * ON READY *
 ************/

$(document).ready(function() {
    loadDOM();

    loadPageLoader();

    loadAssessLinks();

    loadInputs();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/
