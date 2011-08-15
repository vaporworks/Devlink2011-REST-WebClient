(function(global, undefined) {
    // CONSTANTS
    var FETCH_MENU = "getMenu",
        FETCH_ORDER_STATUS = "getOrderStatus",
        PLACE_ORDER = "placeOrder";

    // Set up mock requests
    amplify.request.define(FETCH_MENU, "ajax", {
        url: "/menu",
        dataType: "json",
        type: "GET"
    });

    amplify.request.define(FETCH_ORDER_STATUS, function(settings) {
        var fakeStatus = { orderNumber: settings.data.orderNumber, status: "Some New Status" };
        settings.success(fakeStatus);
    });

    amplify.request.define(PLACE_ORDER, function(settings) {
        settings.success({ orderNumber: settings.data.orderNumber, status: "Created" });
    });

    postal.subscribe("repository.getMenu", function() {
        repository.getMenu();
    });

    postal.subscribe("repository.getOrderStatus", function(data) {
        repository.getOrderStatus(data.orderNumber);
    });

    postal.subscribe("order.submit", function(order) {
        repository.placeOrder(order);   
    });

    var repository = global.repository = {
        getMenu: function() {
            amplify.request(FETCH_MENU, function(data) {
                postal.publish("menu.get", data);
            });
        },

        getOrderStatus: function(orderNumber) {
            var reqData = { orderNumber: orderNumber };
            amplify.request(FETCH_ORDER_STATUS, reqData, function(data) {
                postal.publish("order.status.update", data);
            });
        },

        placeOrder: function(order) {
            amplify.request(PLACE_ORDER, order, function(data) {
                postal.publish("order.submit.response", data);
            });
        }
    };
})(window);

