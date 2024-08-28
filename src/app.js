var express = require("express");
var app = express();
var PORT = 4001;
var http = require("http").Server(app);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//var cors = require("cors");
//app.use(cors());

// Load environment variables from .env file
require('dotenv').config();

// Import and initialize WebSocket
var io = require('./webSocket')(http);

app.post("/api", function (req, res) {
    var order = req.body;
    var name = order.customerFirstname + " " + order.customerLastname;
    var id = order.orderId + new Date().getTime();
    var message = "Order #" + order.incrementId + " is " + order.action;
    var time = "".concat(new Date().getHours(), ":").concat(new Date().getMinutes().toString().length == 1
        ? "0".concat(new Date().getMinutes().toString())
        : new Date().getMinutes());

    io.emit("notification", { name: name, message: message, time: time, id: id });
    res.status(200).json({ name: name, message: message });
});

// Start the server
http.listen(PORT, function () {
    console.log("Server listening on ".concat(PORT));
});

// Import and run the cron jobs
require('./cronJobs');
