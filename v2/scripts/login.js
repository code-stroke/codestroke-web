const Login = {
    DOM: {
        body: "#js-global-body",
        form: "#js-login-form",
        $interim: {}
    },
    load: function() {
        let body_loader = new PageLoader("body",{});
    },
    displayLogin: function() {

        let $body = $(Login.DOM.body);

        // Create the $interim div for the content to fade in
        Login.DOM.$interim = $("<div>")
                                .addClass("global-loader")
                                .appendTo("body")
                                .hide();

        // Load the login.html template
        Login.DOM.$interim.load("templates/login.html", function() {

            // Fade in the login.html overlay + do swipe transition of login content
            Login.DOM.$interim.fadeIn(500);
            $(Login.DOM.form).removeClass("away");

            // Fade out/remove the old body content for security
            $body.fadeOut(500, function() {
                $body.remove();
            });

            // Load the (newly-created) login button
            $(Login.DOM.form).on("submit", function(event) {
                event.preventDefault();

                // {function} Handles verifying with server + loading Global back on succesful login
                Login.submitLogin();
            });
        });
    },
    submitLogin: function() {
        // Create $interim div for normal body content
        let $interim_body = $("<div>")
                                .addClass("global-loader")
                                .appendTo("body")
                                .hide();

        // Load Global back on succesful login
        $interim_body.load("templates/global.html", function() {
            // Fade out/remove the login overlay
            Login.DOM.$interim.fadeOut(500, function() {
                Login.DOM.$interim.remove();
            });
            $(Login.DOM.form).addClass("away");

            // Fade back in the body content
            $interim_body.fadeIn(500, function() {
                $interim_body.children().unwrap();
            });
        });


    }
};
