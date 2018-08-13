const Router = {
    current: {},
    routes: [],
    addRoute: function(route) {
        this.routes.push(route);
    }

};


$(document).ready(function() {
    let global_overlay = new Overlay("#js-global-main",
                                    {
                                        timer: {
                                            top: "50px",
                                            left: "50px"
                                        },
                                        dialog: {
                                            top: "50px",
                                            left: "200px"
                                        }
                                    });



    let global_loader = new PageLoader("#js-global-main",{});

    global_loader.loadPage("list.html", function(){

        global_overlay.showTimer();
        global_loader.loadPage("case.html", function(){
            global_overlay.hideTimer();

            let case_loader = new PageLoader("#js-case-main",{});
            let case_overlay = new Overlay("#js-case-main",
                                            {
                                                timer: {
                                                    top: "50px",
                                                    left: "50px"
                                                },
                                                dialog: {
                                                    top: "50px",
                                                    left: "200px"
                                                }
                                            });


            case_loader.loadPage("case_histories.html", function() {
                case_overlay.showTimer();
                case_loader.loadPage("case_assessments.html", function() {
                    case_overlay.hideTimer();
                    global_loader.loadPage("list.html", function(){});
                });
            });
        });
    });


});
