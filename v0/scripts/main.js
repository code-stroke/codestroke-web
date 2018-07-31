// Local server testing only
var localserver = "http://localhost:5000/";

$(document).ready(function(){
    var user_name = Cookies.get("user_name");
    if (user_name !== undefined) {
	$(".sidebar-user-name span").text(Cookies.get("user_name"));
    } else {
	console.log("Not logged in");
	//window.location.replace("/triage/login.html");
    }
});
