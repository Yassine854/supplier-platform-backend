var express = require("express");
var app = express();
var PORT = 4001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var http = require("http").Server(app);
var cors = require("cors");
app.use(cors());

const cron = require("node-cron");
const axios = require("axios");

//Websocket
var socketIO = require("socket.io")(http, {
    cors: {
        origin: "*",
    },
});
socketIO.on("connection", function (socket) {
    console.log(": ".concat(socket.id, " user just connected!"));
    socket.on("disconnect", function () {
        console.log(": A user disconnected");
    });
});
app.post("/api", function (req, res) {
    var order = req.body;
    var name = order.customerFirstname + " " + order.customerLastname;
    var id = order.orderId + new Date().getTime();
    var message = "Order #" + order.incrementId + " is " + order.action;
    var time = "".concat(new Date().getHours(), ":").concat(new Date().getMinutes().toString().length == 1
        ? "0".concat(new Date().getMinutes().toString())
        : new Date().getMinutes());
    socketIO.emit("notification", { name: name, message: message, time: time, id: id });
    res.status(200).json({ name: name, message: message });
});
http.listen(PORT, function () {
    console.log("Server listening on ".concat(PORT));
});



//Cron Jobs 
const apiKey = process.env.API_KEY;
const baseURL = process.env.BASE_URL;

const servicesClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
    },
});

//Health Check
cron.schedule("* * * * *", async () => {
    try {
        console.info("Cron is Working ", Date());
    } catch (error) {
        console.error(error);
    }
});

//Midnight Cron
cron.schedule("0 0 0 * * *", async () => {
    try {
        await servicesClient.post("/api/typesense/populateOrdersCollection");
    } catch (error) {
        console.error(error);
    }
});


//Midnight Cron
cron.schedule('0 0 2 * * *', async () => {
    try {
        await servicesClient.post("/api/typesense/analytics/nucCollections/nucPreviousMonthsCollection/populateCollection");
    } catch (error) {
        console.error(error);
    }
});



//Midnight Cron
cron.schedule('0 0 2 * * *', async () => {
    try {
        await servicesClient.post("/api/typesense/analytics/gmvCollections/gmvPreviousMonthsCollection/populateCollection");
    } catch (error) {
        console.error(error);
    }
});


//Midnight Cron
cron.schedule('0 0 2 * * *', async () => {
    try {
        await servicesClient.post("/api/typesense/analytics/gmvCollections/gmvPreviousDaysCollection/populateCollection");
    } catch (error) {
        console.error(error);
    }
});
