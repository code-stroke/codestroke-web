const DOM_Assess = {};

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
    DOM_Assess["btns"].click(function() {
        let loc = $(this).data("anchor");
        let val = DOM_Assess[loc].offset().top - DOM_Assess["section"].offset().top + DOM_Assess["section"].scrollTop();

        DOM_Assess["section"].animate({
            scrollTop: val
        }, {
            duration: 500,
            easing: "swing"
        })

    });
}

function loadDOM() {
    let assess = {
        section: $("#js-assess-section"),
        btns: $(".js-assess-button"),
        mass: $("#js-assess-mass"),
        vitals: $("#js-assess-vitals"),
        race: $("#js-assess-race"),
        cannula: $("#js-assess-cannula"),
        nihss: $("#js-assess-nihss"),
        mrs: $("#js-assess-mrs"),
        submit: $("#js-assess-submit")
    }
    $.extend(DOM_Assess, assess);
}

/************
 * ON READY *
 ************/

$(document).ready(function() {
    loadDOM();

    loadAssessLinks();

    loadInputs();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/
