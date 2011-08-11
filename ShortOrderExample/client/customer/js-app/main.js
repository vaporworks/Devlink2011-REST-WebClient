// binds to the order namespace
var orderViewModel = {
    isVisible: ko.observable(true),
    name: ko.observable(""),
    orderNumber: ko.observable(uuid()),
    items: ko.observableArray([]),
    clear: function() {
        this.name("");
        this.orderNumber(uuid());
        this.items([]);
    },
    place: function() {
        var order = ko.mapping.toJS(this);
        delete order.isVisible;
        order.timeStamp = new Date();
        postal.publish("order.enqueue", order);
        this.clear();
    }
};

// ugly but perhaps clever hack to track any updates to view model that we need to persist to storage
orderViewModel.publishChange = ko.dependentObservable(function() {
    var n = this.name(),
        o = this.orderNumber(),
        i = [];
    for(var x = 0; x < this.items().length; x++) {
        i.push(ko.mapping.toJS(this.items()[x]));
    }
    postal.publish("activeOrder.change", {name: n, orderNumber: o, items: i });
    return true;
}, orderViewModel);

orderViewModel.cost = ko.dependentObservable(function() {
    var cost = 0;
    this.items().forEach(function(item) {
        cost += (item.qty() * item.pricePerUnit()) || -1;
    });
    return "$ " + (cost).toFixed(2);
}, orderViewModel);

orderViewModel.enableSubmit = ko.dependentObservable(function() {
    return  this.name() !== undefined &&
            this.name().length > 0 &&
            this.orderNumber() !== undefined &&
            this.orderNumber().length > 0 &&
            this.items().length > 0
}, orderViewModel);

postal.subscribe("order.items.remove", function(item) {
    var target = orderViewModel.items().filter(function(x) { return x.id() === item.id; });
    if(target.length !== 0) {
        orderViewModel.items.remove(target[0]);
    }
});

postal.subscribe("order.items.add", function(item) {
    var target = orderViewModel.items().filter(function(x) { return x.id() === item.id; });
    if(target.length === 0) {
        if(!item.qty) {
            item.qty = 1;
        }
        var orderedItem = ko.mapping.fromJS(item);
        orderedItem.dispQty = ko.dependentObservable(function() {
            if(this.qty() < 10) {
                return "0" + this.qty().toString(10);
            }
            return this.qty();
        }, orderedItem);
        orderedItem.qtyClass = ko.dependentObservable(function() {
            var cls = "";
            switch(this.qty()){
                case 1:
                    cls = "lightQty";
                    break;
                case 2:
                    cls = "dimQty";
                    break;
                case 3:
                    cls = "darkQty";
                    break;
                default:
                    cls = "darkestQty";
                    break;
            };
            return cls;
        }, orderedItem);
        orderedItem.remove = function() {
            postal.publish("order.items.remove", ko.mapping.toJS(orderedItem));
        };
        orderViewModel.items.push(orderedItem);
    }
    else {
        target[0].qty(target[0].qty() + 1);
    }
});

postal.subscribe("menu.get", function(data) {
    var menuViewModel = ko.mapping.fromJS(data);
    menuViewModel.isVisible = ko.observable(true);
    if(menuViewModel.items()) {
        var len = menuViewModel.items().length;
        menuViewModel.items().forEach(function(item) {
            item.addMenuItem = function() {
                postal.publish("order.items.add", ko.mapping.toJS(item));
            }
        });
    }
    ko.applyBindings(menuViewModel, 'menu');
});

var orderHistoryViewModel = {
    orders: ko.observableArray([]),
    isVisible: ko.observable(true)
};

postal.subscribe("order.enqueue", function(order) {
    var placedOrder = ko.mapping.fromJS(order);
    placedOrder.status = ko.observable("pending");
    placedOrder.dispTimeStamp = ko.dependentObservable(function() {
        return this.timeStamp().getMonth() + "/" + this.timeStamp().getDate() + "/" +
               this.timeStamp().getFullYear() + " " + this.timeStamp().toLocaleTimeString();
    }, placedOrder);
    var token;
    token = postal.subscribe("order.submit.response", function(data) {
        placedOrder.status(data.status);
        token();
    });
    orderHistoryViewModel.orders.push(placedOrder);
    var enqueuedOrder = {
        name: placedOrder.name(),
        orderNumber: placedOrder.orderNumber(),
        items: ko.mapping.toJS(placedOrder.items),
        cost: placedOrder.cost(),
        timeStamp: placedOrder.timeStamp(),
        status: placedOrder.status(),
        dispTimeStamp: placedOrder.dispTimeStamp()
    };
    postal.publish("order.enqueued", enqueuedOrder);
    postal.publish("order.submit", enqueuedOrder);
});

postal.subscribe("ko.init", function() {
    ko.applyBindings(orderViewModel, 'order');
    ko.applyBindings(orderHistoryViewModel, 'history');
});

postal.subscribe("storage.enqueuedOrders", function(enqueuedOrders) {
    if(enqueuedOrders) {
        enqueuedOrders.forEach(function(order) {
            var ord = ko.mapping.fromJS(order);
            orderHistoryViewModel.orders.push(ord);
        });
    }
});

postal.subscribe("storage.activeOrder", function(activeOrder) {
    if(activeOrder) {
        orderViewModel.name(activeOrder.name);
        orderViewModel.orderNumber(activeOrder.orderNumber);
        activeOrder.items.forEach(function(item) {
            postal.publish("order.items.add", ko.mapping.toJS(item));
        });
    }
});

postal.subscribe("storage.menu", function(menu) {
    postal.publish("menu.get", menu);
});

$(function() {
    ko.externaljQueryTemplateEngine.setOptions({
        templateUrl: "templates",
        templatePrefix: "",
        templateSuffix: ".html"
    });

    postal.publish("ko.init");
    postal.publish("storage.load.menu",{});
    postal.publish("storage.load.activeOrder",{});
    postal.publish("storage.load.enqueuedOrders",{});
    postal.publish("repository.getMenu");
});