(function(global, undefined) {
    // CONSTANTS
    var FETCH_MENU = "getMenu";

    // Set up mock requests
    amplify.request.define(FETCH_MENU, function(settings){
        var fakeMenu = {
            items: [
                { id: 0, description: "Burger",    pricePerUnit: (1.00).toFixed(2), imageUrl: "/img/burger.png" },
                { id: 1, description: "Fries",     pricePerUnit: (.50).toFixed(2),  imageUrl: "/img/fries.png" },
                { id: 2, description: "Drink",     pricePerUnit: (1.25).toFixed(2), imageUrl: "/img/drink.png" },
                { id: 3, description: "Milkshake", pricePerUnit: (2.00).toFixed(2), imageUrl: "/img/shake.png" },
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

