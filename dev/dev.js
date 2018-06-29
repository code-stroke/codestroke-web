let DOM = {
    load: function() {
        DOM.nav_main = $("#nav-main");
        DOM.nav_main_admin = $("#nav-main-admin");
        DOM.nav_main_patients = $("#nav-main-patients");
        DOM.nav_main_patients = $("#nav-main-patients");
        DOM.nav_second = $("#nav-second");

        DOM.path = $("#path");
        DOM.path_input = $("#path-input");

        DOM.input = $("#input");

        DOM.submit = $("#query-submit");
    }
};

let Query = {
    schema: {},
    table: "admin",
    load: function() {
        $.get('schema.json', function(data) {
            Query.schema = data
            console.log("Schema: " + JSON.stringify(Query.schema,null,4));

        }, 'json');

        DOM.submit.on("click", function() {
            let data = {};
            if (Query.table == "add") {
                let boxes = DOM.input.find(".input-box");

            } else {
                let fields = DOM.input.find(".input");
                $.each(fields, function(index, element) {
                    data[$(element).prop("name")] = $(element).val();
                });
            }

            console.log("Schema: " + JSON.stringify(data,null,4));

        });
    },
    loadFields: function(table) {
        DOM.input.html("");
        Query.table = table;

        if (table == "add") {
            DOM.input.append(`
                <div class="input-box" data-table="case_id">
                    <div class="input-box-row heading">
                        ID
                    </div>
                    <div class="input-box-row">
                        <label>case_id</label>
                        <input name="case_id" type="number" class="input">
                    </div>
                </div>
                `);

            for (let i = 0; i < Query.schema.length; i++) {
                if (Query.schema[i].table.startsWith("case")) {
                    let obj = Query.schema[i].fields;

                    let box = $(`
                    <div class="input-box" data-table="${Query.schema[i].table}">
                        <div class="input-box-row heading">
                            ${Query.schema[i].table.slice(5)}
                        </div>
                    </div>`);

                    $.each(obj, function( key, value ) {
                        if (key != "case_id") {
                            box.append(Query.parseField(key, value));
                        }
                    });

                    DOM.input.append(box);
                }
            }
        } else {
            let obj;
            for (let i = 0; i < Query.schema.length; i++) {
                if (Query.schema[i].table == table) {
                    obj = Query.schema[i].fields;
                }
            }

            let box = $(`<div class="input-box"></div>`);

            $.each(obj, function( key, value ) {
                box.append(Query.parseField(key, value));
            });

            DOM.input.append(box);
        }
    },
    parseField: function(key,type) {
        let element = $(`<div class="input-box-row"></div>`);

        let label = $("<label>" + key + "</label>")

        let input = $("<input>");

        switch (type.toUpperCase().slice(0,3)) {
            case "VAR":
                input.attr("type", "text");

                //Takes out the number from the brackets
                let maxLength = type.split("(")[1].split(")")[0];
                input.attr("maxlength", maxLength);
                break;
            case "INT":
            case "TIN":
            case "FLO":
                input.attr("type", "number");
                break;
            case "DAT":
                if (type.toUpperCase() == "DATETIME") {
                    input.attr("type", "datetime-local");
                } else {
                    input.attr("type", "date");
                }

                break;
            case "TEX":
                input = $("<textarea>");
                break;
            case "BOO":
                input = $(`
                    <select>
                        <option selected hidden disabled value=""></option>
                        <option value="0"> False </option>
                        <option value="1"> True </option>
                    </select>
                    `);
                input.attr("name", key);
                break;
            default:
                break;
        }

        input.prop("name", key);
        input.addClass("input");

        element.append(label);
        element.append(input);

        return element;
    }
};


let Nav = {
    load: function() {
        DOM.nav_main.on("click", "li", function() {
            $(this).addClass("selected");
            $(this).siblings("li").removeClass();

            switch ($(this).data("section")) {
                case "admin":
                    DOM.input.html("");
                    DOM.nav_second.html("");
                    DOM.input.append(`
                        <div class="input-box">
                            <div class="input-box-row">
                                Database
                            </div>
                            <div class="input-box-row">
                                <button data-action="check-db">Check DB</button>
                            </div>
                            <div class="input-box-row">
                                <button data-action="create-db">Create DB</button>
                            </div>
                        </div>
                        `);
                    break;
                case "patients":
                    DOM.input.html("");
                    DOM.nav_second.html("");
                    DOM.nav_second.append(`
                        <li data-table="add" class="selected">
                            Add New
                        </li>
                        `);

                    for (let i = 0; i < Query.schema.length; i++) {
                        if (Query.schema[i].table.startsWith("case")) {
                            let section = Query.schema[i].table;
                            if (Query.schema[i].table != "cases") {
                                section = Query.schema[i].table.slice(5);
                            }

                            DOM.nav_second.append(`
                                <li data-table="${Query.schema[i].table}">
                                    ${section}
                                </li>
                                `);
                        }
                        let j = 3;
                    }

                    DOM.nav_second.children("li:first-of-type").trigger("click");
                    break;
                case "clinicians":
                    DOM.input.html("");
                    DOM.nav_second.html("");
                    break;
                default:
                    break;
            }
        });

        DOM.nav_second.on("click", "li", function() {
            $(this).addClass("selected");
            $(this).siblings("li").removeClass();

            Query.loadFields($(this).data("table"));
        })

        DOM.nav_main.children("li:first-of-type").trigger("click");
    }
};

$(document).ready(function() {
    DOM.load();
    Query.load();
    Nav.load();

});
