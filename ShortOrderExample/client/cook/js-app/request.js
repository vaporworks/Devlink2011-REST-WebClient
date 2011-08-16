(function(global, undefined) {
    // CONSTANTS
    var UPDATE_ORDER = "updateOrder",
        GET_ORDERS = "getOrders";

    amplify.request.define(GET_ORDERS, "ajax", {
        url: "/order",
        dataType: "json",
        type: "GET"
    });

    amplify.request.define(UPDATE_ORDER, "ajax", {
        url: "/order/{orderId}",
        dataType: "json",
        type: "PUT"
    });

    postal.subscribe("repository.getOrders", function() {
        repository.getOrders();
    });

    postal.subscribe("order.update", function(order) {
        repository.updateOrder(order);
    });

    postal.subscribe("orders.get", function(){
        setTimeout(function() { postal.publish("repository.getOrders") }, 5000);
    });

    var repository = global.repository = {
        getOrders: function() {
            amplify.request(GET_ORDERS, function(data) {
                postal.publish("orders.get", data);
            });
        },

        updateOrder: function(order) {
            order.timeStamp = order.timeStamp.toString();
            order.orderId = order.orderNumber;
            amplify.request(UPDATE_ORDER, order, function(data) {
                postal.publish("order.newRevision", data);
            });
        }
    };
})(window);

