const DOM_Main = {
    load: function() {
        DOM_Main.search_input = $("#js-cases-search-input");
        DOM_Main.search_cancel = $("#js-cases-search-cancel");
        DOM_Main.search_icon = $("#js-cases-search-cancel");

        DOM_Main.cases_container = $("#js-cases-container");
        DOM_Main.cases_row = $(".case-row");
        DOM_Main.cases_incoming = $("#js-cases-incoming");
        DOM_Main.cases_active = $("#js-cases-active");
        DOM_Main.cases_completed = $("#js-cases-completed");
    }
};

const Search = {
    searching: false,
    input: "",
    list: [],
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

            Search.list = [];

            let regEx = new RegExp(escapeRegExp(Search.input), "ig");

            for (let i = 0; i < Cases.list.length; i++) {
                if (Cases.list[i].name.match(regEx)) {
                    let match = Object.assign({},Cases.list[i]);
                    match.name = match.name.replace(regEx, str => `<mark>${str}</mark>`);
                    Search.list.push(match);
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
    list: [],
    incoming: [],
    active: [],
    completed: [],
    template_row: ({ case_id, name, age_gender, time }) => `
        <a class="case-row" href="/case.html?case_id=${case_id}">
            <div class="case-row-field name" title="${name}">
                <span>${name}</span>
            </div>
            <div class="case-row-field age">
                ${age_gender}
            </div>
            <div class="case-row-field time">
                ${time}
            </div>
        </a>
    `,
    load: function() {
        //Cases.loadFake();

        $.ajax({
            url: "https://codestroke.pythonanywhere.com/cases/",
            method: "GET",
            dataType: "json",
            crossDomain: true,
            success: function(data) {
                console.log(data);
                Cases.list = data.result;

                //Add a 'full name' so searching can be easier
                for (let i = 0; i < Cases.list.length; i++) {
                    Cases.list[i].name = Cases.list[i].first_name + " " + Cases.list[i].last_name;
                }

                Cases.display();
            },
            error: function() {

            }
        });
    },
    loadFake: function() {

        for (let i=0; i < 14; i++) {
            let item = {
                name: faker.name.findName(),
                age: (i + 35) + "M",
                time: i + "min",
                status: 0
            };

            Cases.list.push(item);
        }


        for (let i=0; i < 10; i++) {
            let item = {
                name: faker.name.findName(),
                age: ((2*i) + 8) + "F",
                time: "1hr " + i + "min",
                status: 1
            };

            Cases.list.push(item);
        }

        for (let i=0; i < 44; i++) {
            let item = {
                name: faker.name.findName(),
                age: (i + 22) + "M",
                time: "4hr " + i + "min",
                status: 2
            };

            Cases.list.push(item);
        }
    },
    display: function() {
        DOM_Main.cases_incoming.html("");
        DOM_Main.cases_active.html("");
        DOM_Main.cases_completed.html("");

        let dlist;
        if (Search.searching) {
            dlist = Search.list;
        } else {
            dlist = Cases.list;
        }

        for (let i = 0; i < dlist.length; i++) {
            let row = {};

            row.case_id = dlist[i].case_id;
            row.name = dlist[i].name;

            let agemilli = new Date().getTime() - new Date(dlist[i].dob).getTime();
            let age = Math.floor(agemilli / 31536000000);
            row.age_gender = age + "" + dlist[i].gender.toUpperCase();

            let timemilli = new Date().getTime() - new Date(dlist[i].status_time).getTime();
            let past = false;
            if (dlist[i].status == "incoming") {
                if (timemilli < 0) {
                    timemilli = -timemilli;
                } else {
                    past = true;
                }
            }
            let minutes = Math.floor(timemilli / 60000);
            let hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            if (hours == 0) {
                row.time = `${minutes}m`;
            } else {
                row.time = `${hours}h ${minutes}m`;
            }

            switch (dlist[i].status) {
                case "incoming":
                    if (!past) {
                        row.time = "In " + row.time;
                    } else {
                        row.time = row.time + " late";
                    }

                    DOM_Main.cases_incoming.append(
                        Cases.template_row(row)
                    );
                    break;
                case "active":
                    row.time = row.time + " ago";
                    DOM_Main.cases_active.append(
                        Cases.template_row(row)
                    );
                    break;
                case "completed":
                    row.time = row.time + " ago";
                    DOM_Main.cases_completed.append(
                        Cases.template_row(row)
                    );
                    break;
                default:
                    break;
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

    Search.load();

    Login.check();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/

 function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
