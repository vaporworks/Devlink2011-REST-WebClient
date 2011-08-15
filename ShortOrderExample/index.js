var express = require('express'),
    app = express.createServer();

app.use("/", express.static(__dirname + '/client'));
app.listen(8888);
