var getURLParam = function(parameterName){
	var url = window.location.href;
	try{
		var query = url.split("?")[1];
		var params = query.split("&")
		for(var i = 0; i < params.length; i++){
			var param = params[i];
			var splitted = param.split("=");
			var paramName = splitted[0];
			var paramVal = splitted[1];
			if(paramName == parameterName)
				return paramVal.replace("%20", " ");
		}
		return "";
	} catch (err){
		console.log(err);
		return "";
	}
}

var addAlert = function(msg, type, dismissable=true){
	removeAlerts();
	var newAlert = $("<div class='alert'>" + msg + "</div>");
	newAlert.addClass("alert-" + type);
	if(dismissable)
		newAlert.addClass("alert-dismissable")
	$("#alertDiv").append(newAlert);
}

var removeAlerts = function(){
	$(".alert-dismissable").remove();
	$(".dontremoveyet").addClass("alert-dismissable");
	$(".dontremoveyet").removeClass("dontremoveyet")
}

$(document).click(function(){
	removeAlerts();
})