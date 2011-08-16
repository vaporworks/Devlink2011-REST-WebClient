sys = require "sys"
cradle = require "cradle"

couch = new (cradle.Connection)(
    "http://localhost",
    5984,
    { cache: false, raw: false }
)

db = couch.database( "shortorder" )
db.create()

menuItems = [
    {
        id: 0,
        type: "menuItem",
        description: "Burger",
        pricePerUnit: 1.00,
        imageUrl: "/img/burger.png"
    },
    {
        id: 1,
        type: "menuItem",
        description: "Fries",
        pricePerUnit: .50,
        imageUrl: "/img/fries.png"
    },
    {
        id: 2,
        type: "menuItem",
        description: "Drink",
        pricePerUnit: 1.25,
        imageUrl: "/img/drink.png"
    },
    {
        id: 3,
        type: "menuItem",
        description: "Milkshake",
        pricePerUnit: 2.00,
        imageUrl: "/img/shake.png"
    }
]

db.save("_design/menuItems",
{
    all:
        map: ( doc ) ->
            if doc.type == "menuItem"
                emit( doc.id, doc )
})

db.save("_design/orders",
{
    all:
        map: ( doc ) ->
            if doc.type == "order"
                emit( doc.id, doc )
    bystatus:
        map: ( doc ) ->
            if doc.type == "order"
                emit( doc.status, doc )
})

writeIfMissing = ( item ) ->
    id = item.id.toString()
    db.get( id, ( err, doc ) ->
        if err?
            db.save( id, item,
                ( err, doc ) ->
                    if err?
                        console.log(
                             "Could not save item " +
                             id +
                             " because " +
                             JSON.stringify err )
                    else
                        console.log( " Saved item " + id + ". Yay!" )
            )
        else
            console.log( "No need to save item " + id + ". It's there!" )
    )

writeIfMissing item for item in menuItems