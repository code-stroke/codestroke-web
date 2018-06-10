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

    $("div[data-section='assess']").trigger("click");
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

function loadAssessSection() {
    // Load the Anchor links
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

    //Load score calculations
    $("body").on("ui:select", ".-ui-select", function() {
        calcAssessScore("race", "race_score");
        calcAssessScore("nihss", "nihss_score");
        calcAssessScore("mrs", "mrs_score");
    });
}

function calcAssessScore(container_name, score_name) {
    let score = 0;
    $(DOM_Assess[container_name]).find("input").each(function(){
        //Don't add Toggle inputs
        if (!$(this).parent().hasClass("-ui-select")) {
            return;
        }

        score += parseInt($(this).val());

    });

    //Print out
    if (score) {
        $(DOM_Assess[score_name]).text(score);
        $(DOM_Assess[score_name]).removeClass("empty");
    } else {
        $(DOM_Assess[score_name]).text("??");
        $(DOM_Assess[score_name]).addClass("empty");
    }
}

function loadDOM() {
    let assess = {
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

    loadAssessSection();

    loadInputs();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/
