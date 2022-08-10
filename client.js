const { Socket } = require("socket.io");

const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:8000");


    ioClient.emit('notify',{"a":"ali"});

 