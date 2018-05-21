// Local server testing only
var localserver = "http://localhost:5000/";

$(document).ready(function(){
    var user_name = Cookies.get("user_name");
    if (user_name !== undefined) {
	window.location.replace("/");
    } else {
	console.log("Not logged in.");
    }
});

function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    var login_link = localserver + "login";
    $.ajax({
	type: "POST",
	url: login_link,
	//Local server testing only
	headers: {'Access-Control-Allow-Origin': 'http://localhost:5000'},
	data: {"id_token": id_token, "provider": "google"},	
	dataType: 'jsonp',
	contentType: 'json',
	jsonpCallback: "callback",
	success: function(jsondata){
	    Cookies.set("user_name", jsondata["name"],
			"social_id", jsondata["social_id"],
			{ expires: 30 });
	    console.log("Login successful.");
	    window.location.replace("/triage");
	}
    })
}

    
	
    

	
