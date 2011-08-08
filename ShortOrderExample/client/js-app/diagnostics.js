postal.wireTaps.push(function(topic, data) {
    try {
        console.log(topic + ": " + JSON.stringify(data || {}));
    }
    catch(exception) {
        console.log(topic + ": (Unable to show JSON data)");
    }
});
