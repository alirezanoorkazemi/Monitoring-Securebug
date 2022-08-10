require('./appConfig');
mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/logger');
require('./models');
 const model = require('./server.model');

const { Server } = require("socket.io"),
    server = new Server(8000);


// event fired every time a new client connects:
server.on("connection", async(socket) => {
    try{

    socket.on('log',async(data)=>{
        console.log(data);
       await Log2Admin(socket,data);

    })

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        console.info(`Client Disconnected [id=${socket.id}]`);
    });
    }catch(e){
        console.log(e)
    }
});


 async function Log2Admin (socket, data) {
    try {
        var ip = socket.handshake.address.replace('::ffff:', '');
        data['server_ip'] = ip;
        data['server_name'] = 'S1';
        let reuslt = await model.insertLog(data);
    }
    catch (e) {
        console.log(e);
    }
};

