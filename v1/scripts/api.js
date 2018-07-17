const API = {
    address: "https://codestroke.pythonanywhere.com",
    list: function(callback) {
        $.ajax({
            url: `${API.address}/cases/`,
            method: "GET",
            dataType: "json",
            crossDomain: true,
            success: function(data) {
                callback(data.result);
            },
            error: function(data) {

            }
        });
    },
    get: function(table, case_id, callback) {
        $.ajax({
            url: `${API.address}/${table}/${case_id}/`,
            method: "GET",
            dataType: "json",
            crossDomain: true,
            success: function(data) {
                callback(data.result[0]);
            },
            error: function(data) {

            }
        });
    },
    put: function(table, case_id, data, callback) {
        $.ajax({
            url: `${API.address}/${table}/${case_id}/`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(result) {
                callback(result);
            },
            error: function(obj, e1, e2) {
                console.log(`ERROR | e1: ${e1} , e2: ${e2}`);
            }
        });
    },

    putacknowledge: function(case_id) {
        alert("test")
        $.ajax({
            url: `${API.address}/acknowledge/${case_id}/`,
            method: "POST",
            contentType: "application/json",

            error: function() {
                console.log('case_id putacknowledge' + case_id);
            }
        });
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
