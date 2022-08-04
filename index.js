var express = require('express')
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mysql = require('mysql')
var session = require('express-session')

mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "food_database"
})



var app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: "secret" }))


function isProductincart(cart, id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }
    return false;
}

function calculateTotal(cart, req) {

    total = 0;
    for (let i = 0; i < cart.length; i++) {
        //if there is a salw price on the product
        if (cart[i].sale_price) {
            total = total + (cart[i].sale_price * cart[i].quantity)
        } else {
            total = total + (cart[i].price * cart[i].quantity)
        }
    }
    req.session.total = total;
    return total;
}


app.get('/', function (req, res) {

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "food_database"
    })
    con.query("SELECT * FROM products", (err, result) => {

        res.render('pages/index', { result: result });
    })


})
app.listen(3000, function () {
    console.log("server is running on port 3000")
})

app.post('/add_to_cart', function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var quantity = req.body.quantity;
    var image = req.body.image;

    var product = { id: id, name: name, price: price, sale_price: sale_price, quantity: quantity, image: image };

    if (req.session.cart) {
        var cart = req.session.cart;

        if (!isProductincart(cart, id)) {
            cart.push(product);
        }
    } else {
        req.session.cart = [product];
        var cart = req.session.cart;
    }

    //calculate toal of cart
    calculateTotal(cart, req);


    //return to cart page
    res.redirect('/cart');
});


app.get('/cart', function (req, res) {

    var cart = req.session.cart;
    var total = req.session.total;

    res.render('pages/cart', { cart: cart, total: total });

})

app.post('/edit_product_quantity', function (req, res) {
    var id = req.body.id;
    var quantity = req.body.quantity;
    var increase_btn = req.body.increase_product_quantity;
    var decrease_btn = req.body.decrease_product_quantity;

    var cart = req.session.cart;

    if (increase_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {

                if (cart[i].quantity > 0) {
                    cart[i].quantity = parseInt(cart[i].quantity + 1);
                }

            }
        }
    }
    if (decrease_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {

                if (cart[i].quantity > 1) {
                    cart[i].quantity = parseInt(cart[i].quantity - 1);
                }

            }
        }
    }


    calculateTotal(cart, req);
    res.redirect('/cart');


})

// app.post('/remove_product',function(req,res){

// })