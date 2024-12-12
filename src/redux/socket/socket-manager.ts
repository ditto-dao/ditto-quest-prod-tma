import { io, Socket } from 'socket.io-client';
import store from '../store';
import { setConnected } from './socket-slice';
import { SOCKET_ORIGIN, SOCKET_PATH } from '../../utils/config';

class SocketManager {
    private static instance: Socket | null;

    static connect() {
        if (!this.instance) {
            this.instance = io(SOCKET_ORIGIN, {
                path: SOCKET_PATH,
                transports: ['websocket', 'polling'],
            });

            this.instance.on('connect', () => {
                console.log('Connected to socket server')
                store.dispatch(setConnected(true));
            });

            this.instance.on('disconnect', () => {
                console.log('Disconnected from socket server')
                store.dispatch(setConnected(false));
            });
        }
    }

    static disconnect() {
        if (this.instance) {
            this.instance.disconnect();
            this.instance = null;
            store.dispatch(setConnected(false));
        }
    }

    public static getInstance(): Socket | null {
        return this.instance;
    }
}

export default SocketManager;
