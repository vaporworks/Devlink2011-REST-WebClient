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

    amplify.request.define(FETCH_ORDER_STATUS, "ajax", {
        url: "/order/{orderNumber}",
        dataType: "json",
        type: "GET"
    });

    amplify.request.define(PLACE_ORDER, "ajax", {
        url: "/order",
        dataType: "json",
        type: "POST"
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
                postal.publish("order.status.update", { orderNumber: orderNumber, status: data.status });
            });
        },

        placeOrder: function(order) {
            order.timeStamp = order.timeStamp.toString();
            amplify.request(PLACE_ORDER, order, function(data) {
                postal.publish("order.submit.response", {orderNumber: order.orderNumber, status: data.status });
            });
        }
    };
})(window);

