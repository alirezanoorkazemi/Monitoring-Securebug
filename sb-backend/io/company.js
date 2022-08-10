const adminIO = require('./admin');

companyIO.on("connection", async (socket) => {
    try {
        let user = await connectionEvent(socket);
        if (user && isObjectID(user._id)) {
            let already_onlined = false;
            companyIO.sockets.forEach((value, key) => {
                if (value.data && isObjectID(value.data._id) && key.toString() !== socket.id.toString()) {
                    if (value.data.email.toLowerCase() === user.email.toLowerCase()) {
                        already_onlined = true;
                    }
                }
            });
            if (!already_onlined){
                if (adminIO && adminIO["sockets"] && adminIO["sockets"].size > 0 && adminIO["to"]){
                    adminIO["sockets"].forEach((value, key) => {
                        if (value.data && isObjectID(value.data._id) && value.data.user_access === toNumber(ADMIN_ROLES.ADMIN)) {
                            adminIO["to"](key).emit('online', {id: user._id,parent_id: user.parent_user_id, is_online: true});
                        }
                    });
                }
            }
            socket.data = {
                _id: user._id,
                parent_id: user.parent_user_id,
                email: user.email
            };
            socket.join("companies");
        }


        companyIO.sockets.forEach((value, key) => {
            if (!value.data || !isObjectID(value.data._id)) {
                companyIO.in(key).disconnectSockets();
            }
        });
        socket.on('disconnect', async () => {
            let still_onlined = false;
            companyIO.sockets.forEach((value, key) => {
                if (value.data && isObjectID(value.data._id) && key.toString() !== socket.id.toString()) {
                    if (value.data.email.toLowerCase() === socket.data.email.toLowerCase()) {
                        still_onlined = true;
                    }
                }
            });
            if (!still_onlined){
                if (adminIO && adminIO["sockets"] && adminIO["sockets"].size > 0 && adminIO["to"]){
                    adminIO["sockets"].forEach((value, key) => {
                        if (value.data && isObjectID(value.data._id) && value.data.user_access === toNumber(ADMIN_ROLES.ADMIN)) {
                            adminIO["to"](key).emit('online', {id: user._id,parent_id: user.parent_user_id, is_online: false});
                        }
                    });
                }
            }
            companyIO.in(socket.id).disconnectSockets();
            await disconnectEvent(socket, user);
        });
        socket.on('serverDateTime', async () => {
            socket.emit('serverDateTime', getDateTime());
        });
    } catch (e) {
        console.log(e);
    }
});

async function connectionEvent(socket) {
    try {
        console.log('connectionEvent!');
        const token = isUndefined(socket.handshake.headers.token) ? '' : socket.handshake.headers.token;
        const user = await getCompanyLogin(token, false, false);
        if (isNumber(user)) {
            await disconnectUserBySocketId(socket);//token user is invalid logout and disconnect
            return;
        }
        return user;
    } catch (e) {
        console.log(e);
        return '';
    }
}

async function disconnectEvent(socket, user) {
    try {
        console.log('disconnectEvent!');
        await disconnectUserBySocketId(socket);
    } catch (e) {
        console.log(e);
    }
}

async function disconnectUserBySocketId(socket) {
    try {
        socket.disconnect();
    } catch (e) {
        console.log(e);
    }
}

module.exports = companyIO;

