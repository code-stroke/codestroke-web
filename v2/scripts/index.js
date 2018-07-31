const Search = {
    DOM: {
        input: "#js-cases-search-input",
        cancel: "#js-cases-search-cancel",
        icon: "#js-cases-search-cancel",
    },
    searching: false,
    input: "",
    list: [],
    load: function() {
        $(Search.DOM.input).on("keyup", function() {
            DOM_Main.cases_container.scrollTop(0);

            Search.input = $(Search.DOM.input).val();
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

        $(Search.DOM.cancel).hover(
            function() {
                $(Search.DOM.cancel).children("img").prop("src", "icons/button/cancel-red.png");
            },
            function() {
                $(Search.DOM.cancel).children("img").prop("src", "icons/button/cancel.png");
            }
        );

        $(Search.DOM.cancel).on("click", function() {
            $(Search.DOM.input).val("");
            $(Search.DOM.input).trigger("keyup");
        });

        $(Search.DOM.icon).on("click", function() {
            $(Search.DOM.input).focus();
        });
    }
}

const Cases = {
    DOM: {
        container: "#js-cases-container",
        row: ".case-row",
        incoming: "#js-cases-incoming",
        active: "#js-cases-active",
        completed: "#js-cases-completed"
    },
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
            if (data) {
                Cases.list = data;
            }

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
        let dom_incoming = $(Cases.DOM.incoming).empty();
        let dom_active = $(Cases.DOM.active).empty();
        let dom_completed = $(Cases.DOM.completed).empty();

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

        sortAndDisplay(1, rows_incoming, dom_incoming);
        sortAndDisplay(1, rows_active, dom_active);
        sortAndDisplay(-1, rows_completed, dom_completed);

    }
};

const Overlay = {
    DOM: {
        overlay: "#js-overlay",
        timer: "#js-overlay-timer"
    },
    showTimer() {
        this.loading = true;
        $(Overlay.DOM.overlay).removeClass("hidden");
        $(Overlay.DOM.timer).removeClass("hidden");
    },
    hideTimer() {
        this.loading = false;
        $(Overlay.DOM.overlay).addClass("hidden");
        $(Overlay.DOM.timer).addClass("hidden");
    },
    loading: false
}

const Refresh = {
    DOM: {
        text: "#js-refresh-text",
        button: "#js-refresh-button"
    },
    load: function() {
        $(Refresh.DOM.text).text(new Date().toLocaleTimeString());

        $(Refresh.DOM.button).on("click", function() {
            location.reload();
        });
    }
}

/************
 * ON READY *
 ************/

$(document).ready(function() {
    Cases.load();

    Search.load();

    Refresh.load();
});

/*******************
 *  MISC FUNCTIONS *
 *******************/

 function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
