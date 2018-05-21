// Local server testing only
var localserver = "http://localhost:5000/";

$(document).ready(function(){
    $("#sign-in-form").attr("action", "javascript:void(0);"); //failsafe
    $("#sign-in-form").submit(function() {
	$.ajax({
	    type: "POST",
	    url: localserver + "login",
	    data: $("#sign-in-form").serialize(),
	    success: function(jsondata){
		if (jsondata.hasOwnProperty("username")) {
		    Cookies.set("username", jsondata["username"],
				{ expires: 30 });
		    console.log("Login successful.");
		    window.location.replace("/");
		} else {
		    console.log("Login failed.")
		    $("#error-container").css("visibility", "visible").text("Error");
		}
	    },
	    error: function(){
		// TODO More comprehensive error handling
		$("#error-container").css("visibility", "visible").text("Error");
	    }
	})
	return false;
    });
});


