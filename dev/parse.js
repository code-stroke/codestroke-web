/**
 * Parses the schema.sql into a readable format for the Dev App
 */

function parse(data) {
    let index = 0;
    let u_index = index + 1;

    let result = [];

    let inDocument = true;
    let test = 0;
    while (inDocument) {
        let table = getTable("");
        if (table) {
            result.push(table);
        }


        test++;
    }

    return result;

    function getTable() {
        let table = {};

        index = data.indexOf("CREATE TABLE", index);
        if (index < 0) {
            inDocument = false;
            return;
        }
        index = data.indexOf("`", index);
        index++;
        u_index = data.indexOf("`", index);

        table["table"] = data.substring(index, u_index);
        table["fields"] = {};

        let end = data.indexOf(";", index);
        let inTable = true;
        while (inTable) {
            getField();
        }

        index = end;

        return table;

        function getField() {
            index = data.indexOf("`", u_index + 1);
            if (index > end || index < 0) {
                inTable = false;
                return;
            }
            index++;
            u_index = data.indexOf("`", index);
            let field = data.substring(index, u_index);

            index = data.indexOf(" ", u_index);
            index++;
            u_index = index;

            let openingBracket = false;
            let inType = true;
            while (inType) {
                u_index++;

                if (data.charAt(u_index).match(/\(/)) {
                    if (!openingBracket) {
                        openingBracket = true;
                        continue;
                    } else {
                        inType = false;
                        break;
                    }
                }

                if (data.charAt(u_index).match(/\)/)) {
                    if (openingBracket) {
                        u_index++;
                    }
                    inType = false;
                    break;
                }

                if (data.charAt(u_index).match(/[a-zA-Z0-9]/)) {
                    continue;
                } else {
                    inType = false;
                    break;
                }
            }

            let type = data.substring(index, u_index);

            table["fields"][field] = type;
        }
    }
}





$( document ).ready(function() {
    $.get('schema.sql', function(data) {
        let table = parse(data);

        $(document).append("<pre>" + JSON.stringify(table, undefined, 4) + "<pre>");

    }, 'text');
});
