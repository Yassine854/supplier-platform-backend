// webSocket.js
var socketIO = require("socket.io");

module.exports = function (http) {
    var io = socketIO(http, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", function (socket) {
        console.log(": ".concat(socket.id, " user just connected!"));

        socket.on("disconnect", function () {
            console.log(": A user disconnected");
        });
    });

    return io;
};
