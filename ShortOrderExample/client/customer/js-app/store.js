postal.subscribe("menu.get", function(data) {
    amplify.store("menu", data);
});

postal.subscribe("order.enqueued", function(data) {
    var enqueuedOrders = amplify.store("enqueuedOrders") || [];
    enqueuedOrders.push(data);
    amplify.store("enqueuedOrders" , enqueuedOrders);
});

postal.subscribe("activeOrder.change", function(data) {
    if((data.name && data.name.length > 0) || data.items.length > 0) {
        amplify.store("activeOrder", data);
    }
    else {
        amplify.store("activeOrder", null);
    }
});

postal.subscribe("storage.load.menu", function() {
    var menu = amplify.store("menu");
    if(menu) {
        postal.publish("storage.menu", menu);
    }
});

postal.subscribe("storage.load.activeOrder", function() {
    var order = amplify.store("activeOrder");
    if(order) {
        postal.publish("storage.activeOrder", order);
    }
});

postal.subscribe("storage.load.enqueuedOrders", function() {
    var orders = amplify.store("enqueuedOrders");
    if(orders) {
        orders.forEach(function(order) { order.timeStamp = Date.parse(order.timeStamp); });
        postal.publish("storage.enqueuedOrders", orders);
    }
});

postal.subscribe("order.status.update", function(data) {
    var target = amplify.store("enqueuedOrders");
    if(data.orderNumber && data.status && target) {
        target.filter(function(x) { return x.orderNumber === data.orderNumber; })[0].status = data.status;
    }
    amplify.store("enqueuedOrders", target);
});

postal.subscribe("order.submit.response", function(data) {
    var target = amplify.store("enqueuedOrders");
    if(data.orderNumber && data.status && target) {
        target.filter(function(x) { return x.orderNumber === data.orderNumber; })[0].status = data.status;
    }
    amplify.store("enqueuedOrders", target);
});
