class Utilities {
    /**
     * Search through an Array of Objects and match a certain key-value pair
     * @param  {array}   array  The array to search through
     * @param  {string}  key
     * @param  {any}     value
     * @return {object}         The object that has matched
     */
    //TODO: Handle if it doesn't match??
    static getFromArrayByKey(array, key, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                return array[i];
            }
        }
    }
}

/**
 * An API Call can have the following properties:
 * @prop {string} name          @required - Name of the Call
 * @prop {string} address       @required - The address to send the HTTP requsts
 * @prop {string} addressExtra  optional  - Extra info to add to end of address (eg. id)
 * @prop {string} method        @required - The type of HTTP request (POST, GET, etc.)
 * @prop {object} required      optional  - Key-Value of required parameters + datatypes
 * @prop {object} optional      optional  - Key-Value of optional parameters + datatypes
 * @prop {object} result        optional  - The expected JSON result returned from serve
 */

//TODO: Future: Store API Calls in a .json file

let apiCalls = new Array();
function loadAPICalls() {
    $.getJSON("api.json", function(data) {
        apiCalls = data;

        //Removes the first element
        //First element is just the API Version and not an API call
        apiCalls.shift();

        createAPIElements();
    });
}

function createAPIElements() {
    for (let i = 0; i < apiCalls.length; i++) {
        //First create a list of categories
        let category = $("<option value='" + apiCalls[i].category + "'>" + apiCalls[i].category + "</option>");
        $("#js-categories").append(category);

        let calls = apiCalls[i].calls;

        for (let j = 0; j < calls.length; j++) {
            let requiredList = new Array();
            if (calls[j].hasOwnProperty('addressExtra') && calls[j]['addressExtra']) {
                $.each( calls[j].addressExtra, function( key, value ) {
                  requiredList.push(parseAPIElement(key, value));
                });
            }

            if (calls[j].hasOwnProperty('required') && calls[j]['required']) {
                $.each( calls[j].required, function( key, value ) {
                  requiredList.push(parseAPIElement(key, value));
                });
            }

            let optionalList = new Array();
            if (calls[j].hasOwnProperty('optional') && calls[j]['optional']) {
                $.each( calls[j].optional, function( key, value ) {
                  optionalList.push(parseAPIElement(key, value));
                });
            }

            calls[j].elements = {
                required: requiredList,
                optional: optionalList
            }
        }

    }
}

/**
 * Converts the data to be sent into input element for the front-end
 * @param  {string}         key      The data key
 * @param  {string}         datatype The data type
 * @return {JQueryElement}           The input element that will be displayed on the page
 */
function parseAPIElement(key, datatype) {
    let label = $("<label>" + key + "</label>")

    let input = $("<input>");
    input.attr("name", key);

    //Handle the different datatypes
    datatype = datatype.toUpperCase();
    if (datatype.startsWith("VARCHAR")) {

        input.attr("type", "text");

        //Takes out the number from the brackets
        let maxLength = datatype.split("(")[1].split(")")[0];
        input.attr("maxlength", maxLength);

    } else if (datatype.startsWith("INT")) {

        input.attr("type", "number");

        //Converts the max length into 999... etc.
        let maxLength = datatype.split("(")[1].split(")")[0];
        let maxNum = Math.pow(10, parseInt(maxLength)) - 1;

        input.attr("min", 0);
        input.attr("max", maxNum);
        input.attr("step", 1);
    } else if (datatype.startsWith("DATE")) {
        input.attr("type", "date");
    } else if (datatype.startsWith("LIST")) {

        //TODO:

    }

    let element = label.add(input);

    return element;
}

/**
 * When you select an API call from the list , the correct input fields will show up
 */
let currCategory;
let currAPICall;
function selectAPICall() {
    //When a category is selected --> Update the available calls
    $("#js-categories").change(function() {
        $("#js-required").html("<h4>Required</h4>");
        $("#js-optional").html("<h4>Optional</h4>");

        currCategory = Utilities.getFromArrayByKey(
                                    apiCalls,
                                    "category",
                                    $("#js-categories").find(":selected").val());

        $("#js-calls").html('<option style="display:none;"></option>');
        for (let i = 0; i < currCategory.calls.length; i++) {
            let call = $("<option value='" + currCategory.calls[i].name + "'>"
                            + currCategory.calls[i].name
                            + "</option>");
            $("#js-calls").append(call);
        }
    });

    //When a call is selected --> Update the input fields
    $("#js-calls").change(function() {
        $("#js-required").html("<h4>Required</h4>");
        $("#js-optional").html("<h4>Optional</h4>");

        currAPICall = Utilities.getFromArrayByKey(
                                    currCategory.calls,
                                    "name",
                                    $("#js-calls").find(":selected").val());
        for (let i = 0; i < currAPICall.elements.required.length; i++) {
            currAPICall.elements.required[i].val("");
            $("#js-required").append(currAPICall.elements.required[i]);
        }
        for (let i = 0; i < currAPICall.elements.optional.length; i++) {
            currAPICall.elements.optional[i].val("");
            $("#js-optional").append(currAPICall.elements.optional[i]);
        }
    });
}

function loadSubmit() {
    $("#js-submit").click(function() {
        //If an option hasn't been chosen yet
        if(!currAPICall) {
            return;
        }

        let valid = true;
        let data = {};
        let address = $("#js-address").val(); //+ ":" + $("#js-port").val();
        address += currAPICall.address;

        $("#js-errors").html("");

        if (currAPICall.hasOwnProperty('addressExtra') && currAPICall['addressExtra']) {
            $.each( currAPICall.addressExtra, function( key, value ) {
                let input = $('input[name="' + key + '"]', $("#js-required"));

                let inputError = validateInput(input, value);
                if (inputError.startsWith("Valid")) {
                    address += "/" + input.val();
                } else {
                    $("#js-errors").append(createError(key, inputError));
                    valid = false;
                }

            });
        }

        if (currAPICall.hasOwnProperty('required') && currAPICall['required']) {
            $.each( currAPICall.required, function( key, value ) {
                let input = $('input[name="' + key + '"]', $("#js-required"));

                let inputError = validateInput(input, value);
                if (inputError.startsWith("Valid")) {
                    data[key] = input.val();
                } else {
                    $("#js-errors").append(createError(key, inputError));
                    valid = false;
                }

            });
        }

        if (currAPICall.hasOwnProperty('optional') && currAPICall['optional']) {
            $.each( currAPICall.optional, function( key, value ) {
                let input = $('input[name="' + key + '"]', $("#js-optional"));

                let inputError = validateInput(input, value);
                if (inputError.startsWith("Valid")) {
                    data[key] = input.val();
                } else if (inputError.startsWith("Empty")) {
                    //If Empty & Optional, can just leave it alone
                } else {
                    $("#js-errors").append(createError(key, inputError));
                    valid = false;
                }

            });
        }

        //Displays the finished API Call just for debug purposes
        if (valid) {
            $("#js-output-address").val(address);
            $("#js-output-method").val(currAPICall.method);
            $("#js-output-data").val(JSON.stringify(data, null, 1));
        } else {
            $("#js-output-address").val("");
            $("#js-output-method").val("");
            $("#js-output-data").val("");
            return;
        }

        //TODO: Future: Handle the response from the server
        if ($("#js-send").is(":checked")) {
            $.ajax({
                url: address,
                type: currAPICall.method,
                data: data,
                success: function(result) {
                  console.log("Success: " + result);
                },
                error: function(a, error, exception) {
                  console.log("Error: " + error + " | " + exception);
                }
            });
        }


    });
}

/**
 * Validates the inputs to the API Call to make sure they match the correct datatypes
 * Possible return values:
 * @return {"Valid"}
 * @return {"Empty"}
 *
 * @return {Error Message} - Error Message to be sent to the user
 *
 */
function validateInput(input, datatype) {
    if (!input.val()) {
        return "Empty";
    }

    if (datatype.startsWith("VARCHAR")) {

        let maxLength = parseInt(datatype.split("(")[1].split(")")[0]);
        if (input.val().length > maxLength) {
            return "Input length is maximum of " + maxLength + " characters";
        }

    } else if (datatype.startsWith("INT")) {

        //Checks if the input is actually a number
        if (!input.val().match("^[0-9]+$")) {
            return "Input must only contain numbers";

        }

        let maxLength = parseInt(datatype.split("(")[1].split(")")[0]);
        if (input.val().length > maxLength) {
            return "Input length is maximum of " + maxLength + " characters";

        }

    } else if (datatype.startsWith("DATE")) {
        if (!Date.parse(input.val())) {
            return "Input must be a valid date";
        }
    } else if (datatype.startsWith("LIST")) {

        //TODO:

    }

    return "Valid";

}

function createError(name, error) {
    let element = $("<div class='error'></div>");
    element.text(name + " - " + error);
    return element;
}


$( document ).ready(function() {
    loadAPICalls();

    selectAPICall();

    loadSubmit();
});
