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

let apiCalls = new Array();
function createAPICalls() {

    apiCalls.push({
        name: "create-db",
        address: "/create_db",
        method: "POST"
    });

    apiCalls.push({
        name: "delete-db",
        address: "/delete_db",
        method: "POST"
    });

    /*********************
     * Patient API Calls *
     *********************/

    apiCalls.push({
        name: "get-patients",
        address: "/patients",
        method: "GET",
        optional: {
            first_name: "VARCHAR(20)",
            last_name: "VARCHAR(20)",
            city: "VARCHAR(30)"
        }
    });

    apiCalls.push({
        name: "get-patient",
        address: "/patients",
        addressExtra: {
            patient_id: "INT(8)"
        },
        method: "GET"
    });

    //Adds a new patient
    apiCalls.push({
        name: "add-patient",
        address: "/patients",
        method: "POST",
        required: {
            first_name: "VARCHAR(20)",
            last_name: "VARCHAR(20)",
            dob: "DATE",
            address: "VARCHAR(40)",
            city: "VARCHAR(30)",
            state: "VARCHAR(20)",
            postcode: "VARCHAR(20)",
            phone: "VARCHAR(20)",
            urn: "INT(8)"
        },
        optional: {
            hospital_id: "INT(8)"
        },
        result: {
            patient_id: "INT(8)"
        }
    });

    apiCalls.push({
        name: "edit-patient",
        address: "/patients",
        addressExtra: {
            patient_id: "INT(8)"
        },
        method: "PUT",
        optional: {
            first_name: "VARCHAR(20)",
            last_name: "VARCHAR(20)",
            dob: "DATE",
            address: "VARCHAR(40)",
            city: "VARCHAR(30)",
            state: "VARCHAR(20)",
            postcode: "VARCHAR(20)",
            phone: "VARCHAR(20)",
            hospital_id: "INT(8)",
            urn: "INT(8)"
        }
    });

    apiCalls.push({
        name: "remove-patient",
        address: "/patients",
        addressExtra: {
            patient_id: "INT(8)"
        },
        method: "DELETE"
    });


    /***********************
     * Clinician API Calls *
     ***********************/

     apiCalls.push({
         name: "get-clinicians",
         address: "/clinicians",
         method: "GET",
         optional: {
             first_name: "VARCHAR(20)",
             last_name: "VARCHAR(20)",
             hospital_id: "INT(8)",
             group: "VARCHAR(20)" //TODO: What datatype is this?
         }
     });

     apiCalls.push({
         name: "get-clinician",
         address: "/clinicians",
         addressExtra: {
             clinician_id: "INT(8)"
         },
         method: "GET"
     });

     apiCalls.push({
         name: "add-clinician",
         address: "/clinicians",
         method: "POST",
         required: {
             first_name: "VARCHAR(20)",
             last_name: "VARCHAR(20)",
             hospitals: "LIST", //TODO: Clarify
             groups: "LIST" //TODO: Clarify
             //TODO: Type
         },
         optional: {
             hospital_id: "INT(8)"
         },
         result: {
             clinician_id: "INT(8)"
         }
     });

     apiCalls.push({
         name: "edit-clinician",
         address: "/clinicians",
         addressExtra: {
             clinician_id: "INT(8)"
         },
         method: "PUT",
         optional: {
             first_name: "VARCHAR(20)",
             last_name: "VARCHAR(20)",
             hospitals: "LIST", //TODO: Clarify
             groups: "LIST" //TODO: Clarify
             //TODO: Type
         }
     });

     apiCalls.push({
         name: "remove-clinician",
         address: "/clinicians",
         addressExtra: {
             clinician_id: "INT(8)"
         },
         method: "DELETE"
     });

     /***********************
      * Hospital API Calls *
      ***********************/

      ////////////////////////////////////////
      //TODO: Add the rest of the API Calls //
      ////////////////////////////////////////


}

function createAPIElements() {
    for (let i = 0; i < apiCalls.length; i++) {
        let requiredList = new Array();
        if (apiCalls[i].hasOwnProperty('addressExtra') && apiCalls[i]['addressExtra']) {
            $.each( apiCalls[i].addressExtra, function( key, value ) {
              requiredList.push(parseAPIElement(key, value));
            });
        }

        if (apiCalls[i].hasOwnProperty('required') && apiCalls[i]['required']) {
            $.each( apiCalls[i].required, function( key, value ) {
              requiredList.push(parseAPIElement(key, value));
            });
        }

        let optionalList = new Array();
        if (apiCalls[i].hasOwnProperty('optional') && apiCalls[i]['optional']) {
            $.each( apiCalls[i].optional, function( key, value ) {
              optionalList.push(parseAPIElement(key, value));
            });
        }

        apiCalls[i].elements = {
            required: requiredList,
            optional: optionalList
        }

    }
}

/**
 * Converts the data to be sent into input element for the front-end
 * @param  {string}         key      The data key
 * @param  {string}         datatype The data type
 * @return {JQueryElement}           The input element that can be
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
let currentAPICall;
function loadAPICalls() {
    for (let i = 0; i < apiCalls.length; i++) {
        let select = $("<option value='" + apiCalls[i].name + "'>" + apiCalls[i].name + "</option>");
        $("#js-select").append(select);
    }

    $("#js-select").change(function() {
        $("#js-required").html("<h4>Required</h4>");
        $("#js-optional").html("<h4>Optional</h4>");
        currentAPICall = getAPICallByName($("#js-select").find(":selected").val());
        for (let i = 0; i < currentAPICall.elements.required.length; i++) {
            currentAPICall.elements.required[i].val("");
            $("#js-required").append(currentAPICall.elements.required[i]);
        }
        for (let i = 0; i < currentAPICall.elements.optional.length; i++) {
            currentAPICall.elements.optional[i].val("");
            $("#js-optional").append(currentAPICall.elements.optional[i]);
        }
    });
}

function getAPICallByName(name) {
    for (let i = 0; i < apiCalls.length; i++) {
        if (apiCalls[i].name == name) {
            return apiCalls[i];
        }
    }
}

function loadSubmit() {
    $("#js-submit").click(function() {
        //If an option hasn't been chosen yet
        if(!currentAPICall) {
            return;
        }

        let valid = true;
        let data = {};
        let address = $("#js-address").val() + ":" + $("#js-port").val();
        address += currentAPICall.address;

        $("#js-errors").html("");

        if (currentAPICall.hasOwnProperty('addressExtra') && currentAPICall['addressExtra']) {
            $.each( currentAPICall.addressExtra, function( key, value ) {
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

        if (currentAPICall.hasOwnProperty('required') && currentAPICall['required']) {
            $.each( currentAPICall.required, function( key, value ) {
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

        if (currentAPICall.hasOwnProperty('optional') && currentAPICall['optional']) {
            $.each( currentAPICall.optional, function( key, value ) {
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
            $("#js-output-method").val(currentAPICall.method);
            $("#js-output-data").val(JSON.stringify(data, null, 1));
        } else {
            $("#js-output-address").val("");
            $("#js-output-method").val("");
            $("#js-output-data").val("");
        }

        //TODO: Future: Handle the response from the server
        if ($("#js-send").is(":checked")) {
            $.ajax({
                url: address,
                type: currentAPICall.method,
                data: data,
                success: function(result) {

                },
                error: function(a, error, error2) {

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
    createAPICalls();
    createAPIElements();
    loadAPICalls();

    loadSubmit();
});
