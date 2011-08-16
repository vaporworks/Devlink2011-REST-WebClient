cradle = require "cradle"

couch = new (cradle.Connection)(
    "http://localhost",
    5984,
    { cache: true, raw: false }
)

db = couch.database("shortorder")

exports.setup = ( init ) ->
    init( new Order )

class Order
    constructor: () ->
        db.create()

    index: ( req, res ) ->
        db.view( "orders/all", (err, docs) ->
            if not err?
                list = docs.map( (doc) -> doc )
                res.send( list )
            else
                res.send( [] )
        )

    status: ( req, res ) ->
        res.send( "You asked for order with the status " + req.params.new )

    show: ( req, res ) ->
        db.get( req.params.order.toString(), ( err, doc ) ->
            if not err?
                res.send( doc )
            else
                res.send( 404 )
        )

    create: ( req, res ) ->
        console.log( req.body )
        docId = req.body.orderNumber.toString()
        req.body.status = "Created"
        req.body.type = "order"
        db.save( docId, req.body,
            ( err, doc ) ->
                if not err?
                    res.send( {status: "Created" }, 200 )
                else
                    res.send( err, 500 )
        )

    update: ( req, res ) ->
        console.log( req.body )
        docId = req.params.order.toString()
        rev = req.body._rev
        db.save( docId, rev, req.body
            ( err, doc ) ->
                if not err?
                    res.send( doc, 200 )
                else
                    res.send( err, 500 )
        )