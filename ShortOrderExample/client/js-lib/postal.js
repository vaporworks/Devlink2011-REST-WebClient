// Postal.js alpha
// Author: Jim Cowart
// License: Dual licensed MIT (http://www.opensource.org/licenses/mit-license) & GPL (http://www.opensource.org/licenses/gpl-license)
// Version 0.0.0.0.0.0.0.1 :-)

(function(global, undefined) {

    var _forEachKeyValue = function(object, callback) {
        for(var x in object) {
            if(object.hasOwnProperty(x)) {
                callback(x, object[x]);
            }
        }
    };

    function isArray(value) {
        var s = typeof value;
        if (s === 'object') {
            if (value) {
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length')) &&
                        typeof value.splice === 'function') {
                    s = 'array';
                }
            }
        }
        return s === 'array';
    }

    var slice = [].slice;

    var MessageBroker = function() {
        var subscriptions = {},
            regexify = function(topic) {
                if(!this[topic]) {
                    this[topic] = topic.replace(".", "\.").replace("*", ".*");
                }
                return this[topic];
            }.bind(this),
            isTopicMatch = function(topic, comparison) {
                if(!this[topic + '_' + comparison]) {
                    this[topic + '_' + comparison] = topic === comparison ||
                        (comparison.indexOf("*") !== -1 && topic.search(regexify(comparison)) !== -1) ||
                        (topic.indexOf("*") !== -1 && comparison.search(regexify(topic)) !== -1);
                }
                return this[topic + '_' + comparison];
            }.bind(this);

        this.wireTaps = [];

        this.subscribe = function(topic, callback) {
            var topicList = topic.split(/\s/), // we allow multiple topics to be subscribed in one call.
                subIdx = 0,
                exists;
            topicList.forEach(function(topic) {
                exists = false;
                if(!subscriptions[topic]) {
                    subscriptions[topic] = [callback];
                }
                else {
                    subscriptions[topic].forEach(function(sub) {
                        if(subscriptions[topic][subIdx] === callback) {
                            exists = true;
                        }
                    });
                    if(!exists) {
                        subscriptions[topic].push(callback);
                    }
                }
            });
            // return callback for un-subscribing...
            return function() {
                this.unsubscribe(topic, callback);
            }.bind(this);
        };

        this.publish = function(topic, data) {
            this.wireTaps.forEach(function(tap) {
                if(typeof tap === 'function') {
                    tap(topic, data);
                }
            });
            _forEachKeyValue(subscriptions, function(subNm, subs) {
                if(isTopicMatch(topic, subNm)) {
                    subs.forEach(function(callback) {
                        if(typeof callback === 'function') {
                            callback(data);
                        }
                    });
                }
            });
        };

        this.unsubscribe = function(topic, callback) {
            if ( !subscriptions[ topic ] ) {
                return;
            }
            var length = subscriptions[ topic ].length,
                idx = 0;
            for ( ; idx < length; idx++ ) {
                if (subscriptions[topic][idx] === callback) {
                    subscriptions[topic].splice( idx, 1 );
                    break;
                }
            }
        };
    };

    window.postal = new MessageBroker();
}(window));
