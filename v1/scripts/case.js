function loadInputs() {
    $(".js-input").change(function() {
        if ($(".js-input").val() != "") {
            $(".js-input").addClass("active");
        } else {
            $(".js-input").removeClass("active");
        }
    })
}

/************
 * ON READY *
 ************/

$(document).ready(function() {
    loadInputs();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/
