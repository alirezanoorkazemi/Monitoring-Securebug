const {getAdministrationLogin} = require('../administration/init');

adminIO.on("connection", async (socket) => {
    try {
        let user = await connectionEvent(socket);
        socket.join("moderators");
        socket.data = {
            _id: user._id,
            user_access: user.user_level_access,
            email: user.email
        };
        adminIO.sockets.forEach((value, key) => {
            if (!value.data || !isObjectID(value.data._id)) {
                adminIO.in(key).disconnectSockets();
            }
        });
        socket.on('disconnect', async () => {
            await disconnectEvent(socket, user);
        });
    } catch (e) {
        log(e);
    }
});


async function connectionEvent(socket) {
    try {
        log('connectionEvent!');
        const token = isUndefined(socket.handshake.headers.token) ? '' : socket.handshake.headers.token;
        const user = await getAdministrationLogin(token, false);
        if (isNumber(user)) {
            await disconnectUserBySocketId(socket);//token user is invalid logout and disconnect
            return;
        }
        return user;
    } catch (e) {
        log(e);
        return '';
    }
}

async function disconnectEvent(socket, user) {
    try {
        log('disconnectEvent!');
        await disconnectUserBySocketId(socket);
    } catch (e) {
        log(e);
    }
}

async function disconnectUserBySocketId(socket) {
    try {
        socket.disconnect();
    } catch (e) {
        log(e);
    }
}

module.exports = adminIO;

