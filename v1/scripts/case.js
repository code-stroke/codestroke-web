const DOM_Case = {
    load: function() {
        DOM_Case.case.load();
        DOM_Case.assess.load();
        DOM_Case.radiology.load();
    },
    case: {
        load: function() {
            DOM_Case.case.btns = $(".js-case-button");
            DOM_Case.case.main = $("#js-case-main");
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
    loadPageLoader: function() {
        DOM_Case.case["btns"].click(function() {
            if ($(this).hasClass("selected")) {
                return;
            }

            //Change the page
            DOM_Case.case["main"].html("");
            DOM_Case.case["main"].load(`case-${$(this).data("section")}.html`, function() {
                //Make UI inputs work
                $(document).trigger("case:refresh");
            });


            //Change the selected button
            $(this).siblings(".js-case-button").removeClass("selected");
            $(this).addClass("selected");
        });

        $("div[data-section='ed']").trigger("click");
    }
};

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
                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-0", "y")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-1", "y")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-2", "n")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-3", "y")) {
                    progress++;
                } else {
                    break;
                }

                if (Radiology.checkProgress(DOM_Case.radiology["progress"] + "-4", "y")) {
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

    Case.loadPageLoader();

    Assess.load();
    Radiology.load();

});

/*******************
 *  MISC FUNCTIONS *
 *******************/
