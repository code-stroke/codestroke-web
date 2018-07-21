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

        DOM_Main.overlay = $("#js-overlay");
        DOM_Main.overlay_timer = $("#js-overlay-timer");

        DOM_Main.refresh_text = $("#js-refresh-text");
        DOM_Main.refresh_button = $("#js-refresh-button");

        DOM_Main.add_button = $("#js-add-button");

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
        <a class="case-row" href="./case.html?case_id=${case_id}">
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

        Overlay.showTimer();
        API.list(function(data) {
            console.log(data);
            Cases.list = data;

            //Add a 'full name' so searching can be easier
            for (let i = 0; i < Cases.list.length; i++) {
                Cases.list[i].name = Cases.list[i].first_name + " " + Cases.list[i].last_name;
            }

            Cases.display();
            Overlay.hideTimer();
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

        let rows_incoming = [];
        let rows_active = [];
        let rows_completed = [];
        for (let i = 0; i < dlist.length; i++) {
            let row = {};

            row.case_id = dlist[i].case_id;
            row.name = dlist[i].name;
            row.age_gender = API.data.getAgeGender(dlist[i]);
            row.time = API.data.getStatusTime(dlist[i]);


            switch (dlist[i].status) {
                case "incoming":
                    if (dlist[i].eta) {
                        row.order_time = dlist[i].eta;
                    } else {
                        row.order_time = (new Date().getFullYear() + 1) + "-12-12";
                    }
                    rows_incoming.push(row);
                    break;
                case "active":
                    row.order_time = dlist[i].active_timestamp;
                    rows_active.push(row);
                    break;
                case "completed":
                    row.order_time = dlist[i].completed_timestamp;
                    rows_completed.push(row);
                    break;
                default:
                    break;
            }
        }

        function sortAndDisplay(modifier, array, dom) {
            array.sort(function(a, b) {
                return modifier * (new Date(a.order_time).getTime() - new Date(b.order_time).getTime());
            });
            $.each(array, function(index, row) {
                dom.append(
                    Cases.template_row(row)
                );
            });
        }

        sortAndDisplay(1, rows_incoming, DOM_Main.cases_incoming);
        sortAndDisplay(1, rows_active, DOM_Main.cases_active);
        sortAndDisplay(-1, rows_completed, DOM_Main.cases_completed);

    }
};

const Overlay = {
    showTimer() {
        this.loading = true;
        DOM_Main.overlay.removeClass("hidden");
        DOM_Main.overlay_timer.removeClass("hidden");
    },
    hideTimer() {
        this.loading = false;
        DOM_Main.overlay.addClass("hidden");
        DOM_Main.overlay_timer.addClass("hidden");
    },
    loading: false
}

const Refresh = {
    load: function() {
        DOM_Main.refresh_text.text(new Date().toLocaleTimeString());

        DOM_Main.refresh_button.on("click", function() {
            location.reload();
        });
    }
}

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

    Refresh.load();

    Login.check();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/

 function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
