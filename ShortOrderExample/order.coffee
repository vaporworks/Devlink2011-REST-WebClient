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
        docId = req.body.id.toString()
        db.save( docId, req.body,
            ( err, doc ) ->
                if not err?
                    res.send( 201, doc )
                else
                    res.send( 500, err )
        )

    update: ( req, res ) ->
        docId = req.params.order
        rev = req.body.rev
        db.save( docId, rev, req.body.rev,
            ( err, doc ) ->
                if not err?
                    res.send( 200, doc )
                else
                    res.send( 500, err )
        )