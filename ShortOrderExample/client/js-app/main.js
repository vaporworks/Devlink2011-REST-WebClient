// binds to the order namespace
/*var orderViewModel = {
    name: ko.observable(""),
    orderNumber: ko.observable(""),
    items: ko.observableArray([])
};

var orderHistoryViewModel = {
    orders: ko.observableArray([])
};*/

// binds to the menu namespace;
var menuViewModel = ({
    items: ko.observableArray([]),

    init: function() {
        postal.subscribe("menu.get", function(data) {
            this.items.removeAll();
            this.items(data.items);
        }.bind(this));
        return this;
    }
}).init();

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

    //ko.applyBindings(orderViewModel, 'order');
    //ko.applyBindings(orderHistoryViewModel, 'history');
    ko.applyBindings(menuViewModel);
    //ko.applyBindings(infoViewModel, 'info');

    repository.getMenu();
});