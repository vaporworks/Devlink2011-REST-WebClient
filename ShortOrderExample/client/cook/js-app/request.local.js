(function(global, undefined) {
    // CONSTANTS
    var UPDATE_ORDER_STATUS = "updateOrderStatus",
        GET_ORDERS = "getOrders",
        fakeOrderNumA = uuid(),
        fakeOrderNumB = uuid();

    amplify.request.define(GET_ORDERS, function(settings) {
        var fakeOrders = [
            {
                name: "Jim",
                orderNumber: fakeOrderNumA,
                items: [
                    {"id":0,"description":"Burger","pricePerUnit":"1.00","imageUrl":"/img/burger.png","qty":3},
                    {"id":1,"description":"Fries","pricePerUnit":"0.50","imageUrl":"/img/fries.png","qty":3}
                ],
                cost: 4.50,
                timeStamp: new Date(),
                status: "Created"
            },
            {
                name: "Alex",
                orderNumber: fakeOrderNumB,
                items: [
                    {"id":0,"description":"Burger","pricePerUnit":"1.00","imageUrl":"/img/burger.png","qty":3},
                    {"id":1,"description":"Fries","pricePerUnit":"0.50","imageUrl":"/img/fries.png","qty":3}
                ],
                cost: 4.50,
                timeStamp: new Date(),
                status: "Created"
            }
        ];
        settings.success(fakeOrders);
    });

    amplify.request.define(UPDATE_ORDER_STATUS, function(settings) {
        settings.success({ orderNumber: settings.data.orderNumber, status: settings.data.status });
    });

    postal.subscribe("repository.getOrders", function() {
        repository.getOrders();
    });

    postal.subscribe("order.update", function(data) {
        repository.updateOrderStatus(data.orderNumber, data.status);
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

        updateOrderStatus: function(orderNumber, status) {
            var reqData = { orderNumber: orderNumber, status: status };
            amplify.request(UPDATE_ORDER_STATUS, reqData, function(data) {
                postal.publish("order.status.updated", data);
            });
        }
    };
})(window);

