var navigationViewModel = {
    inProgressLabel: ko.observable("Hide In Progress"),
    completedLabel: ko.observable("Show Completed"),

    toggleInProgress: function() {
        postal.publish("navigation.inProgress.toggle", {});
        return false;
    },
    toggleCompleted: function() {
        postal.publish("navigation.completed.toggle", {});
        return false;
    }
};

postal.subscribe("navigation.inProgress.toggle", function() {
    if(navigationViewModel.inProgressLabel() === "Show In Progress") {
        navigationViewModel.inProgressLabel("Hide In Progress");
    }
    else {
        navigationViewModel.inProgressLabel("Show In Progress");
    }
});

postal.subscribe("navigation.completed.toggle", function() {
    if(navigationViewModel.completedLabel() === "Show Completed") {
        navigationViewModel.completedLabel("Hide Completed");
    }
    else {
        navigationViewModel.completedLabel("Show Completed");
    }
})

var ordersViewModel = {
    orders: ko.observableArray([]),
    inProgressVisible: ko.observable(true),
    completedVisible: ko.observable(false)
};

ordersViewModel.inProgressOrders = ko.dependentObservable(function(){
    return this.orders().filter(function(order) { return order.status() !== "Completed" });
}, ordersViewModel);

ordersViewModel.completedOrders = ko.dependentObservable(function(){
    return this.orders().filter(function(order) { return order.status() === "Completed" });
}, ordersViewModel);

postal.subscribe("order.status.change", function(data) {
    var target = ordersViewModel.orders().filter(function(x) { return x.orderNumber() === data.orderNumber; });
    if(target && target.length > 0) {
        target[0].status(data.status);
        if(data.status === 'Completed') {
            target[0].completed(new Date());
        }
    }
});

postal.subscribe("orders.get", function(data) {
    data.orders.forEach(function(x) {
        var order = ko.mapping.fromJS(x);
        if(typeof order.timeStamp() === "string") {
            try {
                var dt = new Date(order.timeStamp());
                order.timeStamp(dt);
            }
            catch(exception) {
                // nothing at the moment.  SAD FACE
            }
        }
        order.completed = ko.observable();
        order.dispCompleted = ko.dependentObservable(function(){
            if(!this.completed()) {
                return "";
            }
            return this.completed().getMonth() + "/" + this.completed().getDate() + "/" +
                   this.completed().getFullYear() + " " + this.completed().toLocaleTimeString();
        }, order);
        order.dispCost = ko.dependentObservable(function() {
            return "$ " + (order.cost()).toFixed(2);
        }, order);
        order.dispTimeStamp = ko.dependentObservable(function() {
            return this.timeStamp().getMonth() + "/" + this.timeStamp().getDate() + "/" +
                   this.timeStamp().getFullYear() + " " + this.timeStamp().toLocaleTimeString();
        }, order);
        order.nextStatus = ko.dependentObservable(function(){
            var nextStatus = "";
            switch(this.status()) {
                case 'Created':
                    nextStatus = "Received";
                break;
                case 'Received':
                    nextStatus = "Cooking";
                break;
                case 'Cooking':
                    nextStatus = "Completed";
                break;
                default:
                    nextStatus = "Completed";
                break;
            }
            return nextStatus;
        }, order);
        order.items().forEach(function(item){
            item.dispQty = ko.dependentObservable(function() {
                if(this.qty() < 10) {
                    return "0" + this.qty().toString(10);
                }
            }, item);
            item.qtyClass = ko.dependentObservable(function() {
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
            }, item);
        });
        order.advanceStatus = function() {
            postal.publish("order.status.change", {orderNumber: this.orderNumber(), status: this.nextStatus() });
        }.bind(order);
        order.canAdvanceStatus = ko.dependentObservable(function() {
            return this.status() !== "Completed"
        }, order);
        ordersViewModel.orders.push(order);
    });
});

postal.subscribe("navigation.inProgress.toggle", function(){
    ordersViewModel.inProgressVisible(!ordersViewModel.inProgressVisible());
});

postal.subscribe("navigation.completed.toggle", function(){
    ordersViewModel.completedVisible(!ordersViewModel.completedVisible());
});

postal.subscribe("ko.init", function() {
    ko.applyBindings(ordersViewModel, 'order');
    ko.applyBindings(navigationViewModel, 'nav');
});

$(function() {
    ko.externaljQueryTemplateEngine.setOptions({
        templateUrl: "templates",
        templatePrefix: "",
        templateSuffix: ".html"
    });

    //postal.publish(postal.SYSTEM_EXCHANGE, "mode.set", {mode: postal.REPLAY_MODE });
    postal.publish("ko.init");
    postal.publish("repository.getOrders", {});
});