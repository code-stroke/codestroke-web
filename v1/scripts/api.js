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
        getLastWell: function(patient) {
            if (!patient.last_well) {
                return "Last Well - Unknown";
            }

            let time = this.extractTime(new Date().getTime() - new Date(patient.last_well).getTime());
            if (time.hour == 0) {
                return `Last Well ${time.minute}m ago`;
            } else {
                return `Last Well ${time.hour}h ${time.minute}m ago`;
            }
        },
        getStatusTime: function(patient) {
            let millis = new Date().getTime() - new Date(patient.status_time).getTime();
            let past = false;
            if (patient.status == "incoming") {
                if (millis < 0) {
                    millis = -millis;
                } else {
                    past = true;
                }
            }

            let time = this.extractTime(millis);
            let time_string;
            if (time.hour == 0) {
                time_string = `${time.minute}m`;
            } else {
                time_string = `${time.hour}h ${time.minute}m`;
            }

            switch (patient.status) {
                case "incoming":
                    if (!past) {
                        return "In " + time_string;
                    } else {
                        return time_string + " late";
                    }
                    break;
                case "active":
                case "completed":
                    return time_string + " ago";
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
