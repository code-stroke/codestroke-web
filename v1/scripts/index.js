const template = {

};

template.row = ({ name, age, time }) => `
    <div class="case-row">
        <div class="case-row-field name" title="${name}">
            <span>${name}</span>
        </div>
        <div class="case-row-field age">
            ${age}
        </div>
        <div class="case-row-field time">
            ${time}
        </div>
    </div>
`;

const DOM_Main = {
    load: function() {
        DOM_Main.search_input = $("#js-cases-search-input");
        DOM_Main.search_cancel = $("#js-cases-search-cancel");
        DOM_Main.search_icon = $("#js-cases-search-cancel");

        DOM_Main.cases_container = $("#js-cases-container");
        DOM_Main.cases_incoming = $("#js-cases-incoming");
        DOM_Main.cases_active = $("#js-cases-active");
        DOM_Main.cases_completed = $("#js-cases-completed");
    }
};

const Search = {
    searching: false,
    input: "",
    incoming: [],
    active: [],
    completed: [],
    load: function() {
        DOM_Main.search_input.on("keyup", function() {
            DOM_Main.cases_container.scrollTop(0);

            Search.input = DOM_Main.search_input.val();
            if (Search.input == "") {
                Search.searching = false;
                Cases.display();
                return;
            } else {
                Search.searching = true;
            }

            Search.incoming = [];
            Search.active = [];
            Search.completed = [];

            let regEx = new RegExp(escapeRegExp(Search.input), "ig");

            for (let i = 0 ; i < Cases.incoming.length; i++) {
                if (Cases.incoming[i].name.match(regEx)) {
                    let match = Object.assign({},Cases.incoming[i]);
                    match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                    Search.incoming.push(match);
                }
            }

            for (let i = 0 ; i < Cases.active.length; i++) {
                if (Cases.active[i].name.match(regEx)) {
                    let match = Object.assign({},Cases.active[i]);
                    match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                    Search.active.push(match);
                }
            }

            for (let i = 0 ; i < Cases.completed.length; i++) {
                if (Cases.completed[i].name.match(regEx)) {
                    let match = Object.assign({},Cases.completed[i]);
                    match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                    Search.completed.push(match);
                }
            }

            Cases.display();
        });

        DOM_Main.search_cancel.hover(
            function() {
                DOM_Main.search_cancel.children("img").prop("src", "icons/button/cancel-red.png");
            },
            function() {
                DOM_Main.search_cancel.children("img").prop("src", "icons/button/cancel.png");
            }
        );

        DOM_Main.search_cancel.on("click", function() {
            DOM_Main.search_input.val("");
            DOM_Main.search_input.trigger("keyup");
        });

        DOM_Main.search_icon.on("click", function() {
            DOM_Main.search_input.focus();
        });
    }
}

const Cases = {
    incoming: [],
    active: [],
    completed: [],
    load: function() {
        DOM_Main.cases_incoming.html("");
        for (let i=0; i < 14; i++) {
            let item = {
                name: faker.name.findName(),
                age: (i + 35) + "M",
                time: i + "min"
            };

            Cases.incoming.push(item);
        }

        DOM_Main.cases_active.html("");
        for (let i=0; i < 10; i++) {
            let item = {
                name: faker.name.findName(),
                age: ((2*i) + 8) + "F",
                time: "1hr " + i + "min"
            };

            Cases.active.push(item);
        }

        DOM_Main.cases_completed.html("");
        for (let i=0; i < 44; i++) {
            let item = {
                name: faker.name.findName(),
                age: (i + 22) + "M",
                time: "4hr " + i + "min"
            };

            Cases.completed.push(item);
        }
    },
    display: function() {
        DOM_Main.cases_incoming.html("");
        DOM_Main.cases_active.html("");
        DOM_Main.cases_completed.html("");

        if (!Search.searching) {
            for (let i = 0 ; i < Cases.incoming.length; i++) {

                DOM_Main.cases_incoming.append(
                    template.row(Cases.incoming[i])
                );
            }

            for (let i = 0 ; i < Cases.active.length; i++) {
                DOM_Main.cases_active.append(
                    template.row(Cases.active[i])
                );
            }

            for (let i = 0 ; i < Cases.completed.length; i++) {
                DOM_Main.cases_completed.append(
                    template.row(Cases.completed[i])
                );
            }
        } else {

            for (let i = 0 ; i < Search.incoming.length; i++) {
                DOM_Main.cases_incoming.append(
                    template.row(Search.incoming[i])
                );
            }

            for (let i = 0 ; i < Search.active.length; i++) {
                DOM_Main.cases_active.append(
                    template.row(Search.active[i])
                );
            }

            for (let i = 0 ; i < Search.completed.length; i++) {
                DOM_Main.cases_completed.append(
                    template.row(Search.completed[i])
                );
            }
        }
    }
};

const Login = {
    check: function() {
        var username = Cookies.get("username");
        if (username !== undefined) {
    	// TODO Replace with actual user's name
    	$(".header-user-name").text(Cookies.get("username"));

        } else {
    	console.log("Not logged in");
    	// Force login (may move to backend)
    	//window.location.replace("/login.html");
        }
    }
};

/************
 * ON READY *
 ************/

$(document).ready(function() {
    DOM_Main.load();

    Cases.load();
    Cases.display();

    Search.load();

    Login.check();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/

 function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
