$(document).ready(function(){
    var app = {isSignedIn: ko.observable()};
    var getSignedInStatus = function(){
        $.get("/isLoggedIn", function(data){
            if(data === true || data === false)
                app.isSignedIn(data);
            else
                app.isSignedIn(false);
        }).fail(function(err){app.isSignedIn(false)});
    }
    var addProductOption = function(productName){
        var lst = $("#productList");
        var newProduct = $("<option value='" + productName + "'>");
        lst.append(newProduct)
    }

    $.get("/products", function(products){
        new Awesomplete(document.getElementById("searchbar"), {list: products});
    })
    getSignedInStatus();
    ko.applyBindings(app)
})