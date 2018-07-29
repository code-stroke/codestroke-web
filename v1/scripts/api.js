const API = {
    address: "https://codestroke.pythonanywhere.com",
    handleResult: function(data) {
        if (data.success) {
            return true;
        }

        if (data.error_type == "auth") {
            window.location.replace(`./login.html`);
            return false;
        }

        //TODO: Handle other errors?
    },
    list: function(callback) {
        $.ajax({
            url: `${API.address}/cases/`,
            method: "GET",
            headers: API.login.headers,
            dataType: "json",
            crossDomain: true,
            success: function(result) {
                if (API.handleResult(result)) {
                    callback(result.result);
                }
            },
            error: function(result) {

            }
        });
    },
    post: function(data, callback) {
        $.extend(data, API.login.signoff);
        $.ajax({
            url: `${API.address}/cases/`,
            method: "POST",
            headers: API.login.headers,
            contentType: "application/json",
            data: JSON.stringify(data),
            crossDomain: true,
            success: function(result) {
                if (API.handleResult(result)) {
                    callback(result.case_id);
                }
            },
            error: function(result) {

            }
        });
    },
    get: function(table, case_id, callback) {
        $.ajax({
            url: `${API.address}/${table}/${case_id}/`,
            method: "GET",
            headers: API.login.headers,
            dataType: "json",
            crossDomain: true,
            success: function(result) {
                if (API.handleResult(result)) {
                    callback(result.result[0]);
                }
            },
            error: function(data) {

            }
        });
    },
    put: function(table, case_id, data, callback) {
        $.extend(data, API.login.signoff);
        $.ajax({
            url: `${API.address}/${table}/${case_id}/`,
            method: "PUT",
            headers: API.login.headers,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(result) {
                if (API.handleResult(result)) {
                    callback(result);
                }
            },
            error: function(obj, e1, e2) {
                console.log(`ERROR | e1: ${e1} , e2: ${e2}`);
            }
        });
    },
    putacknowledge: function(additionalData) {
        case_id = additionalData.case_id;
        var signoff_first_name = ${API.login.signoff.signoff_first_name};
        var signoff_last_name = ${API.login.signoff.signoff_last_name};
        var signoff_role = ${API.login.signoff.signoff_role};

        $.ajax({
            url: `${API.address}/acknowledge/${case_id}/`,
            method: "POST",
            headers: API.login.headers,
            contentType: "application/json",
            data: {signoff_first_name: signoff_first_name, signoff_last_name: signoff_last_name, signoff_role: signoff_role},
            success: function(result) {
                if (API.handleResult(result)) {
                    console.log(result);
                }
            },
            error: function() {
                console.log('case_id putacknowledge' + case_id);
            }
        });
    },
    login: {
        loaded: false,
        signoff: {},
        headers: {},
        setCookie: function(data) {
            $.each(data, function(key, value) {
                let cookie = "" + encodeURIComponent(key) + "=" + encodeURIComponent(value) + "; path=/";
                console.log(cookie);
                document.cookie = cookie;
            });

            this.loadCookie();
        },
        loadCookie: function() {
            let string = document.cookie;
            let parts = string.split("; ");

            for (let i = 0; i < parts.length; i++) {
                let subparts = parts[i].split("=");
                subparts[0] = decodeURIComponent(subparts[0]);
                subparts[1] = decodeURIComponent(subparts[1]);
                this.signoff[subparts[0]] = subparts[1];
            }

            this.headers = {
                "Authorization": "Basic " + btoa("Global:" + API.login.signoff.password)
            };
            delete this.signoff.password;

            loaded = true;
        },
        checkCookie: function() {
            if (document.cookie.indexOf("password") > -1) {
                this.loadCookie();
            }
        },
        verify: function(functions) {
            $.ajax({
                url: `${API.address}/`,
                method: "GET",
                headers: API.login.headers,
                crossDomain: true,
                success: function(data) {
                    if (data.success) {
                        functions.success();
                    } else {
                        functions.failure();
                    }
                },
                error: function(data) {

                }
            });
        },
        loadHeader: function() {
            //Load the Name
            let name = `${API.login.signoff.signoff_first_name} ${API.login.signoff.signoff_last_name}`;
            $("#js-login-name").html(name);
            $("#js-login-name").prop("title", name);

            //Load the Logout Button
            $("#js-login-logout").on("click", function() {
                //Step 1: Delete all cookies
                let string = document.cookie;
                let parts = string.split("; ");

                for (let i = 0; i < parts.length; i++) {
                    let cookie = parts[i].split("=")[0];
                    document.cookie = cookie + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                }

                //Step 2: Redirect
                window.location.replace(`./login.html`);
            });
        }
    },
    data: {
        getName: function(patient) {
                return `${patient.first_name} ${patient.last_name}`
        },
        getAge: function(patient) {
            if (!patient.dob) {
                return "??";
            }

            let agemilli = new Date().getTime() - new Date(patient.dob).getTime();
            return Math.floor(agemilli / 31536000000);
        },
        getAgeGender: function(patient) {
            return this.getAge(patient) + "" + patient.gender.toUpperCase();
        },
        extractTime: function(millis) {
            var day, hour, minute, seconds;
            seconds = Math.floor(millis / 1000);
            minute = Math.floor(seconds / 60);
            seconds = seconds % 60;
            hour = Math.floor(minute / 60);
            minute = minute % 60;
            //day = Math.floor(hour / 24);
            //hour = hour % 24;
            return {
                //day: day,
                hour: hour,
                minute: minute,
                second: seconds
            };
        },
        extractTimeString: function(millis) {
            let time = this.extractTime(millis);
            if (time.hour == 0) {
                return `${time.minute}m`;
            } else {
                return `${time.hour}h ${time.minute}m`;
            }
        },
        getLastWell: function(patient) {
            if (!patient.last_well) {
                return "Last Well - Unknown";
            }

            let time_string = this.extractTimeString(new Date().getTime() - new Date(patient.last_well).getTime());
            return `Last Well ${time_string} ago`;
        },
        getStatusTime: function(patient) {
            let millis;
            switch(patient.status) {
                case "incoming":
                    if (!patient.eta) {
                        return "ETA Unknown";
                    }

                    millis = new Date().getTime() - new Date(patient.eta).getTime();
                    // If ETA has passed, then calcuate time since ETA
                    // Otherwise just calculate the ETA
                    if (millis < 0) {
                        millis = -millis;
                        return "In " + this.extractTimeString(millis);
                    } else {
                        return this.extractTimeString(millis) + " late";
                    }
                    break;
                case "active":
                    millis = new Date().getTime() - new Date(patient.active_timestamp).getTime();
                    return this.extractTimeString(millis) + " ago";
                    break;
                case "completed":
                    millis = new Date().getTime() - new Date(patient.completed_timestamp).getTime();
                    return this.extractTimeString(millis) + " ago";
                    break;
            }
        },
        convertDate: function(date) {
            function pad(number) {
                if (number < 10) {
                    return '0' + number;
                }
                return number;
            }

            return date.getFullYear()
                    + "-" + pad(date.getMonth() + 1)
                    + "-" + pad(date.getDate());

        },
        convertDateTime: function(date) {
            function pad(number) {
                if (number < 10) {
                    return '0' + number;
                }
                return number;
            }

            return this.convertDate(date)
                    + " " + pad(date.getHours())
                    + ":" + pad(date.getMinutes());
        }
    }
}

//Ensures that Cookie data is always loaded before everything else
$.holdReady(true);
if (window.location.href.indexOf("login") < 0) {
    API.login.loadCookie();
    API.login.verify({
        success() {
            //Nothing?
            API.login.loadHeader();
            $.holdReady(false);
        },
        failure() {
            window.location.replace(`./login.html`);
        }
    })
} else {
    $.holdReady(false);
}
