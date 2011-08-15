express = require "express"
resource = require "express-resource"
app = express.createServer()

app.use( express.bodyParser() )

app.use("/", express.static( __dirname + "/client" ) )

menu = require( "./menu" )
menu.setup( (x) -> app.resource( "menu", x ) )

order = require( "./order" )
order.setup( (x) -> app.resource( "order", x ) )

app.listen( 8888 )