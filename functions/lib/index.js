var functions = require('firebase-functions');
var express = require('express');
var firebase = require('./my-firebase/index.js');
var User = require('./models/user.js');
var bodyParser = require('body-parser');
var Stripe = require('stripe');
var app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var stripe = new Stripe("sk_test_tSG6oaHAVgravfg8Y7TBIqfh00eI95FtIN");
app.post("/create-user", function (req, res) {
    var data = req.body;
    var user = new User(data.name, data.email, data.pass);
    firebase.create(user.json).then(function (user) {
        console.log("User created: " + user.id);
        stripe.customers.create({}).then(function (customer) {
            firebase.update_(user.id, { stripeId: customer.id }).then(function (res_) {
                res.send({ "user_id": user.id, "msg": "Note this id for further testing" });
            })["catch"](function (err) {
                res.send({ "error": true, "msg": err });
            });
        });
    })["catch"](function (err) {
        res.send({ "error": true, "msg": err });
    });
});
app.post("/subscribe", function (req, res) {
    var data = req.body;
    var fid = data.user_id;
    //let fid = "nnG0TmzWuKSdvrrLmqS9";
    firebase.get(fid).then(function (user) {
        stripe.customers.createSource(user[fid].stripeId, {
            source: data.source
        }).then(function (res_) {
            console.log("Source created successfully");
            stripe.subscriptions.create({
                customer: user[fid].stripeId,
                items: [{ plan: 'nz11' }]
            }).then(function (sub) {
                firebase.update_(fid, {
                    status: sub.status,
                    currentUsage: 0,
                    subscriptionId: sub.id,
                    itemId: sub.items.data[0].id
                }).then(function (data) {
                    res.send(data);
                })["catch"](function (err) {
                    res.send({ "error": true, "msg": err });
                });
            })["catch"](function (err) {
                res.send({ "error": true, "msg": err });
            });
        })["catch"](function (err) {
            res.send({ "error": true, "msg": err });
        });
    })["catch"](function (err) {
        res.send({ "error": true, "msg": err });
    });
});
app.post("/create-project", function (req, res) {
    //let data = {"project" : {"id" : "nauroz1"}, "user_id" : "nnG0TmzWuKSdvrrLmqS9"};
    var data = req.body;
    var projectData = { "project_id": data.name.substr(0, 10) + Date.now(), "name": data.name };
    firebase.create(projectData, "projects").then(function (project) {
        firebase.get(data.user_id).then(function (user) {
            if (user[data.user_id].status != 'active') {
                res.send({ "error": true, "msg": "You must subscribe before you create project. Goto ./subscribe.html to subscribe" });
            }
            stripe.usageRecords.create(user[data.user_id].itemId, {
                quantity: 1,
                timestamp: Math.floor(Date.now() / 1000),
                action: 'increment'
            }).then(function (res_) {
                firebase.update_(data.user_id, { currentUsage: Number(user[data.user_id].currentUsage) + 1 }).then(function (res_) {
                    res.send(res_);
                })["catch"](function (err) {
                    res.send({ "error": true, "msg": err });
                });
            })["catch"](function (err) {
                res.send({ "error": true, "msg": err });
            });
        })["catch"](function (err) {
            res.send({ "error": true, "msg": err });
        });
    })["catch"](function (err) {
        res.send({ "error": true, "msg": err });
    });
});
app.get("/new_root", function (req, res) {
    res.send("Hello World, This is new Root");
});
exports.app = functions.https.onRequest(app);
//app.listen(3003);
console.log("App started");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
