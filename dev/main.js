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

        //Unfortunately, JQuery doesn't properly handle PUT requests
        //We have to manually add the data as a query string to the address
        if (currAPICall.method == "PUT" & !$.isEmptyObject(data)) {
            address += "?" + $.param(data);
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
        if (!input.val().match(/^[0-9]+$/)) {
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

/* Push Notification Handler */

const pushButton = document.querySelector('.js-push-btn');
const applicationServerPublicKey = 'BM2e4iaBRYGSs5I_jXJaXLY6p5_koeOKXK0MbPEsoTIpyrj0rZx3rDUtZ05ueOqn-Cl6W5HrxonQUHlUZtwJA9I';

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/*register service worker and enable button if browser supports push notifications*/
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker registered', swReg);

    swRegistration = swReg;
    initializeUI() ;
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}

function initializeUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.' ;
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server, for now will just print subscription 

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}
