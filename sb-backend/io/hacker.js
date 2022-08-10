hackerIO.on("connection", async (socket) => {
    try {
        let user = await connectionEvent(socket);
        if (user && isObjectID(user._id)) {
            socket.data = {
                _id: user._id,
                email: user.email,
                username: user.username
            };
            socket.join("hackers");
        }
        hackerIO.sockets.forEach((value, key) => {
            if (!value.data || !isObjectID(value.data._id)) {
                hackerIO.in(key).disconnectSockets();
            }
        });
        socket.on('disconnect', async (reason) => {
            hackerIO.in(socket.id).disconnectSockets();
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
        const user = await getHackerLogin(token, false, false);
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

module.exports = hackerIO;

