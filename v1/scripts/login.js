// Local server testing only
var localserver = "http://localhost:5000/";

const Login = {
    DOM: {
        load: function() {
            this.first_name = $("#js-login-first_name");
            this.last_name = $("#js-login-last_name");
            this.role = $("#js-login-role");
            this.password = $("#js-login-password");
            this.button = $("#js-login-button");
            this.errors = $("#js-login-errors");

            this.inputs = ".login-row-input";
        }
    },
    load: function() {
        this.DOM.load();
        this.DOM.button.on("click", function() {
            let data = {};
            let empty = false;
            $("body").find(Login.DOM.inputs).each(function() {
                let key = $(this).attr("id").slice(9);
                let val = $(this).val();
                if (val) {
                    data[key] = val;
                } else {
                    empty = true;
                    return false;
                }
            });

            if (empty) {
                Login.DOM.errors.html("Please fill in all fields and try again");
            } else {
                Login.DOM.errors.html("");
                API.login.setCookie(data);
                API.login.verify({
                    success() {
                        window.location.replace(`./index.html`);
                    },
                    failure() {
                        Login.DOM.errors.html("Incorrect Password. Please try again");
                    }
                })
            }
        });
    }
}

$(document).ready(function(){
    Login.load();
});
