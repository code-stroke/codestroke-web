const Login = {
    DOM: {
        body: "#js-global-body",

        background: "#js-login-background",
        form: "#js-login-form",
        inputs: ".login-input",
        errors: "#js-login-errors",

        name: "#js-login-name",
        logout: "#js-login-logout",

        $interim: {}
    },
    overlay: {},
    setup() {
        Login.server.verify()
        .then(function() {
            Logger.debug("global.js", "Success logging in");

        }, function() {
            Logger.debug("global.js", "Failure logging in");
            Login.display.show();
        });
    },
    logged_in: false,
    server: {
        signoff: {},
        headers: {},
        loadSignoff(data){
            this.signoff = data;
            this.headers = {
                "Authorization": "Basic " + btoa("Global:" + Login.server.signoff.password)
            };
        },
        verify() {
            let def = $.Deferred();
            Logger.debug("login.js", "Data: " + JSON.stringify(Login.server.signoff));
            $.ajax({
                url: `${API.address}/`,
                method: "GET",
                headers: Login.server.headers,
                crossDomain: true,
                success: function(data) {
                    Logger.debug("login.js", "Data: " + JSON.stringify(data));
                    if (data.success) {
                        def.resolve();
                    } else {
                        def.reject();
                    }
                },
                error: function(data) {
                    Logger.error("login.js", "Error sending verification to server");
                }
            });

            return def;
        }
    },
    display: {
        show() {
            let d1 = $.Deferred();
            Login.logged_in = false;

            let $body = $(Login.DOM.body);

            // Create the $interim div for the content to fade in
            Login.DOM.$interim = $("<div>")
                                    .addClass("global-loader")
                                    .appendTo("body")
                                    .hide();

            // Load the login.html template
            Login.DOM.$interim.load("templates/login.html", function() {
                // Setup the Loading overlay
                // Unfortunately this can only be done when the login.html is laoded
                Login.overlay = new Overlay(Login.DOM.background,
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


                // Fade in the login.html overlay + do swipe transition of login content
                Login.DOM.$interim.fadeIn(500);
                $(Login.DOM.form).removeClass("away");

                // Fade out/remove the old body content for security
                $body.fadeOut(500)
                .promise().then(function(){
                    $body.remove();
                    d1.resolve();
                });

                // Load the (newly-created) login button
                $(Login.DOM.form).on("submit", function(event) {
                    event.preventDefault();

                    // {function} Handles verifying with server + loading Global back on succesful login
                    let d2 = Login.display.submit();
                    d2.always(function() {
                        Login.overlay.hideTimer();
                    });
                    d2.done(function() {
                        Router.parseURL();
                    })
                });
            });

            return d1;
        },
        submit() {
            let def = $.Deferred();

            Login.overlay.showTimer();
            $(Login.DOM.errors).html("");

            // Read the data from Login Inputs
            let data = {};
            $(Login.DOM.form).find(Login.DOM.inputs).each(function() {
                let key = $(this).attr("id").slice(6);
                let val = $(this).val();
                data[key] = val;
            });
            // Turn the data into API header
            Login.server.loadSignoff(data);

            // Check if login details are correct
            Login.server.verify()
            .then(function() {
                // on SUCCESS:
                Login.display.hide(def);
            }, function() {
                // on FAIL:
                $(Login.DOM.errors).html("Incorrect Password. Please try again");
                def.reject();
            });

            return def;
        },
        hide(def) {
            Login.logged_in = true;

            // Create $interim div for normal body content
            let $interim_body = $("<div>")
                                    .addClass("global-loader")
                                    .appendTo("body")
                                    .hide();

            // Load Global back on succesful login
            $interim_body.load("templates/global.html", function() {
                // Load name on Global header
                Login.display.loadHeader();

                // Fade out/remove the login overlay
                Login.DOM.$interim.fadeOut(500)
                .promise().then(function() {
                    Login.DOM.$interim.remove();
                });
                $(Login.DOM.form).addClass("away");

                // Fade back in the body content
                $interim_body.fadeIn(500)
                .promise().then(function() {
                    $interim_body.children().unwrap();

                    def.resolve();
                });
            });
        },
        loadHeader() {
            //Load the Name
            let name = `${Login.server.signoff.signoff_first_name} ${Login.server.signoff.signoff_last_name}`;
            $(Login.DOM.name).html(name);
            $(Login.DOM.name).prop("title", name);

            //TODO Load the Logout Button
            $("#js-login-logout").on("click", function() {

            });
        }
    }
};
