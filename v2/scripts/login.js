// Local server testing only
var localserver = "http://localhost:5000/";

const Login = {
    DOM: {
        container: "#js-login-container",

        first_name: "#js-login-first_name",
        last_name: "#js-login-last_name",
        role: "#js-login-role",
        password: "#js-login-password",
        button: "#js-login-button",
        errors: "#js-login-errors",

        inputs = ".login-row-input"
    },
    load: function() {
        Login.DOM.button.on("click", function() {
            let data = {};
            let empty = false;
            $(Login.DOM.container).find(Login.DOM.inputs).each(function() {
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
                $(Login.DOM.errors).html("Please fill in all fields and try again");
            } else {
                $(Login.DOM.errors).html("");
                API.login.setCookie(data);
                API.login.verify({
                    success() {
                        window.location.replace(`./index.html`);
                    },
                    failure() {
                        $(Login.DOM.errors).html("Incorrect Password. Please try again");
                    }
                })
            }
        });
    }
}

$(document).ready(function(){
    Login.load();
});
