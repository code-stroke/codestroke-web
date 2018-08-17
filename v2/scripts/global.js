const Logger = {
    debug_on: true,
    debug(loc, message) {
        if (Logger.debug_on) {
            console.log(`[Debug | ${loc}]: ${message}`);
        }
    },
    warning() {

    },
    error(loc, message) {
        console.log(`%c [Debug | ${loc}]: ${message}`, "color: red");
    }
}

const Router = {
    current_path: [],
    routes: [],
    default_route: {},
    addDefaultRoute(route) {
        Router.default_route = route;
        Router.addRoute(route);
    },
    addRoute(route) {
        this.routes.push(route);
    },
    parseURL() {
        // RegEx that matches appropriate values for the URL Hash
        // eg. #/test , #/test/ , #/test/test1 , #/test/test1/
        // etc.
        let reg = /(^\/(?:\w+\/?)+)$/ig;
        let path = window.location.hash.substring(1);
        if (reg.test(path)) {
            // Separate path into its components
            let frags = path.split("/");
            // Remove any empty strings
            frags = frags.filter(function(value) { return value;});
            Router.parseRoute(frags);
        } else {
            Router.submitRoute(Router.default_route, Router.default_route.path);
        }
    },
    parseRoute(p) {
        // TODO: Handle invalid path

        for (let i = 0; i < Router.routes.length; i++) {
            let route = Router.routes[i];
            if (route.path.length != p.length) {
                continue;
            }

            let variables = {};
            let path = [];
            let matched = false;
            for (let j = 0; j < route.path.length; j++) {
                if (route.path[j].startsWith(":")) {
                    variables[route.path[j].substring(1)] = p[j];
                    matched = true;
                    continue;
                }

                if (route.path[j] == p[j]) {
                    matched = true;
                    continue;
                }

                matched = false;
                break;
            }

            if (!matched) {
                continue;
            }

            Router.submitRoute(route, p, variables);
            return;
        }

        Router.submitRoute(Router.default_route, Router.default_route.path);
    },
    submitRoute(route, path, vars) {
        Router.current_path = path;
        history.pushState(null, null, "#" + "/" + path.join("/") + "/");
        route.callback(vars);
    }

};

const Global = {
    DOM: {},
    overlay: {},
    loader: {},
    setup() {
        Global.overlay = new Overlay("#js-global-main",
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

        Global.loader = new PageLoader("#js-global-main",{});

        Router.addDefaultRoute({
            path: ["list"],
            callback: function (vars) {
                Global.loader.load("/templates/list.html")
                .then(function() {
                    Logger.debug("global.js", "List Page loaded");
                });
            }
        });


    }
};


$(document).ready(function() {
    Global.setup();

    Login.setup();

    Router.addRoute({
        path: ["edit", ":id", ":section"],
        callback: function(vars) {
            console.log(vars);
        }
    });

    //Router.parseRoute(["edit","2",":sectionasasdasd"]);
    //Router.parseRoute(["edit","2", "3"]);
    //Router.parseRoute(["edit","asdfasdf",":sectionasasdasd"]);



});
