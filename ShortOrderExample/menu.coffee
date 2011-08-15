cradle = require "cradle"

couch = new (cradle.Connection)(
    "http://localhost",
    5984,
    { cache: true, raw: false }
)

db = couch.database("shortorder")

exports.setup = ( init ) ->
    init( new Menu )

class Menu
    constructor: () ->
        db.create()

    index: ( req, res ) ->
        db.view( "menuItems/all", (err, docs) ->
            if not err?
                list = docs.map( (doc) -> doc )
                res.send( list )
            else
                res.send( [] )
        )

    show: ( req, res ) ->
        db.get( req.params.menu.toString(), ( err, doc ) ->
            if not err?
                res.send( doc )
            else
                res.send( 404, err )
        )