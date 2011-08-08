// binds to the order namespace
var orderViewModel = {
    isVisible: ko.observable(true),
    name: ko.observable("Jimbo"),
    orderNumber: ko.observable("123456789"),
    items: ko.observableArray([])
};

orderViewModel.cost = ko.dependentObservable(function() {
    var cost = 0;
    this.items().forEach(function(item) {
        cost += (item.qty() * item.pricePerUnit()) || -1;
    });
    return "$ " + (cost).toFixed(2);
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
        item.qty = 1;
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
    //ko.applyBindings(orderViewModel, 'order');
});

var menuItemPrototype = {
    addMenuItem: function() {
        postal.publish("order.items.add", this);
    }
};

postal.subscribe("menu.get", function(data) {
    var menuViewModel = ko.mapping.fromJS(data);
    var len = menuViewModel.items().length;
    menuViewModel.items().forEach(function(item) {
        item.addMenuItem = function() {
            postal.publish("order.items.add", ko.mapping.toJS(item));
        }
    });
    ko.applyBindings(menuViewModel, 'menu');
});

/*var orderHistoryViewModel = {
    orders: ko.observableArray([])
};*/

/*var infoViewModel = {
    messages: ko.observableArray([])
};

infoViewModel.mostRecent = ko.dependentObservable(function() {
    return this.messages[0];
}, infoViewModel);*/

$(function() {
    ko.externaljQueryTemplateEngine.setOptions({
        templateUrl: "templates",
        templatePrefix: "",
        templateSuffix: ".html"
    });

    ko.applyBindings(orderViewModel, 'order');
    //ko.applyBindings(orderHistoryViewModel, 'history');
    //ko.applyBindings(infoViewModel, 'info');

    repository.getMenu();
});