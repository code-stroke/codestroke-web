const template = {};

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

const DOM_Main = {};


let cases_incoming = [];
let cases_active = [];
let cases_completed = [];

let searching = false;
let search = "";
let search_incoming = [];
let search_active = [];
let search_completed = [];

function loadSearch() {
    $("#js-cases-search-input").on("keyup", function() {
        $("#js-cases-container").scrollTop(0);

        search = $("#js-cases-search-input").val();
        if (search == "") {
            searching = false;
            displayCases();
            return;
        } else {
            searching = true;
        }

        console.log(search);

        search_incoming = [];
        search_active = [];
        search_completed = [];

        let regEx = new RegExp(escapeRegExp(search), "ig");

        for (let i = 0 ; i < cases_incoming.length; i++) {
            if (cases_incoming[i].name.match(regEx)) {
                let match = Object.assign({},cases_incoming[i]);
                match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                search_incoming.push(match);
            }
        }

        for (let i = 0 ; i < cases_active.length; i++) {
            if (cases_active[i].name.match(regEx)) {
                let match = Object.assign({},cases_active[i]);
                match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                search_active.push(match);
            }
        }

        for (let i = 0 ; i < cases_completed.length; i++) {
            if (cases_completed[i].name.match(regEx)) {
                let match = Object.assign({},cases_completed[i]);
                match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                search_completed.push(match);
            }
        }

        displayCases();
    });

    $("#js-cases-search-cancel").hover(
        function() {
            $("#js-cases-search-cancel > img").prop("src", "icons/button/cancel-red.png")
        },
        function() {
            $("#js-cases-search-cancel > img").prop("src", "icons/button/cancel.png")
        }
    );

    $("#js-cases-search-cancel").on("click", function() {
        $("#js-cases-search-input").val("");
        $("#js-cases-search-input").trigger("keyup");
    });

    $("#js-cases-search-icon").on("click", function() {
        $("#js-cases-search-input").focus();
    });
}

function displayCases() {
    $("#js-cases-incoming").html("");
    $("#js-cases-active").html("");
    $("#js-cases-completed").html("");

    if (!searching) {
        for (let i = 0 ; i < cases_incoming.length; i++) {

            $("#js-cases-incoming").append(
                template.row(cases_incoming[i])
            );
        }

        for (let i = 0 ; i < cases_active.length; i++) {
            $("#js-cases-active").append(
                template.row(cases_active[i])
            );
        }

        for (let i = 0 ; i < cases_completed.length; i++) {
            $("#js-cases-completed").append(
                template.row(cases_completed[i])
            );
        }
    } else {

        for (let i = 0 ; i < search_incoming.length; i++) {
            $("#js-cases-incoming").append(
                template.row(search_incoming[i])
            );
        }

        for (let i = 0 ; i < search_active.length; i++) {
            $("#js-cases-active").append(
                template.row(search_active[i])
            );
        }

        for (let i = 0 ; i < search_completed.length; i++) {
            $("#js-cases-completed").append(
                template.row(search_completed[i])
            );
        }
    }

}

function loadCases() {
    $("#js-cases-incoming").html("");
    for (let i=0; i < 14; i++) {
        let item = {
            name: faker.name.findName(),
            age: (i + 35) + "M",
            time: i + "min"
        };

        cases_incoming.push(item);
    }

    $("#js-cases-active").html("");
    for (let i=0; i < 10; i++) {
        let item = {
            name: faker.name.findName(),
            age: ((2*i) + 8) + "F",
            time: "1hr " + i + "min"
        };

        cases_active.push(item);
    }

    $("#js-cases-completed").html("");
    for (let i=0; i < 44; i++) {
        let item = {
            name: faker.name.findName(),
            age: (i + 22) + "M",
            time: "4hr " + i + "min"
        };

        cases_completed.push(item);
    }
}

function checkLogin() {
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

/************
 * ON READY *
 ************/

$(document).ready(function() {
    loadCases();

    displayCases();

    loadSearch();

    checkLogin();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/

 function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
