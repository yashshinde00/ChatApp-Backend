import { WebSocketServer,WebSocket } from 'ws';

interface User {
    socket: WebSocket,
    room: string
}

const wss = new WebSocketServer({ port: 8080 });
let allSockets: User[] = [];

wss.on('connection', (socket) => {
    console.log('New connection');

    socket.on('message', (data) => {
        try {
            const parsedMessage = JSON.parse(data.toString());

            if (parsedMessage.type === 'join') {
                const roomId = parsedMessage.payload.roomId;
                console.log(`User joined room: #${roomId}`);

                allSockets.push({ socket, room: roomId });
            }

            if (parsedMessage.type === 'chat') {
                const message = parsedMessage.payload.message;

                const currentUser = allSockets.find(user => user.socket === socket);
                if (!currentUser) return;

                const currentRoom = currentUser.room;

                allSockets.forEach(user => {
                    if (user.room === currentRoom && user.socket !== socket) {
                        user.socket.send(JSON.stringify({
                            type: 'chat',
                            payload: {
                                message
                            }
                        }));
                    }
                });
            }
        } catch (err) {
            console.error('Error parsing message', err);
        }
    });

    socket.on('close', () => {
        allSockets = allSockets.filter(user => user.socket !== socket);
        console.log('Connection closed');
    });
});
