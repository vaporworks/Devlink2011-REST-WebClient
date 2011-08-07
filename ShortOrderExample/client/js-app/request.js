(function(global, undefined) {
    // CONSTANTS
    var FETCH_MENU = "getMenu";

    // Set up mock requests
    amplify.request.define(FETCH_MENU, function(settings){
        var fakeMenu = {
            items: [
                { description: "Burger", pricePerUnit: 1.00 },
                { description: "Fries", pricePerUnit: .50 },
                { description: "Drink", pricePerUnit: 1.25 },
                { description: "Milkshake", pricePerUnit: 2.00 },
            ]
        };
        settings.success(fakeMenu);
    });

    var repository = global.repository = {
        getMenu: function() {
            amplify.request(FETCH_MENU, function(data) {
                postal.publish("menu.get", data);
            });
        }
    };
})(window);

