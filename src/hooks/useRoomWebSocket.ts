import { Subject } from "rxjs";
import { retryWhen, tap, delay } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";

const URL = "ws://localhost:8000";

//https://stackoverflow.com/questions/47552174/rxjs-observable-websocket-get-access-to-onopen-onclose?rq=1
export const openEvents$ = new Subject<Event>();
export const closeEvents$ = new Subject<Event>();
export const messages$ = new Subject();

export const connection$ = webSocket({
    url: URL,
    openObserver: openEvents$,
    deserializer: (e: MessageEvent) => {
        return e.data;
    },
    closeObserver: closeEvents$
});

export const processor$ = connection$.pipe(
    tap((msg) => {
        messages$.next(msg);
    }),
    retryWhen((errors) =>
        errors.pipe(
            tap((err) => {
                console.error("Got error", err);
            }),
            delay(5000)
        )
    )
);

// import {useEffect, useRef, useState} from "react";


// // const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
// const WEBSOCKET_URL = "ws://localhost:8000";


// export function useRoomWebSocket(roomId, user, setMessages) {
//     const wsRef = useRef(null);
//     const [shouldRedirect, setShouldRedirect] = useState(false);
//     const [gameState, setGameState] = useState({
//         players: [],
//         bots: [],
//         kickedPlayers: [],
//     });

//     // Function to send game actions to the WebSocket
//     const sendGameAction = (actionType, payload = {}) => {
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             const message = {
//                 type: actionType,
//                 payload: payload
//             };
//             wsRef.current.send(JSON.stringify(message));
//         }
//     };

//     // Helper function to make a move
//     const makeMove = (action) => {
//         sendGameAction("make_move", {
//             player: user?.username,
//             action: action,
//             room_code: roomId
//         });
//     };

//     const handleDisconnect = () => {
//         wsRef.current.close();
//         wsRef.current = null;
//     }

//     useEffect(() => {
//         if (!roomId) return;
//         let isCleaningUp = false;
//         const token = tokenManager.getToken();
//         const ws = new WebSocket(
//             `${WEBSOCKET_URL}/ws/${roomId}?token=${token}`
//         );
//         wsRef.current = ws;
//         // ws.onopen = () => {
//         //     // if (!isCleaningUp) {
//         //     //     // console.log(`Connected to room ${roomId}`);
//         //     //     // setConnectionStatus('connected');
//         //     // }
//         // };

//         ws.onmessage = (event) => {
//             if (isCleaningUp) return;

//             let parsed;
//             try {
//                 parsed = JSON.parse(event.data);
//             } catch {
//                 parsed = {type: 'message', message: event.data};
//             }

//             switch (parsed.type) {
//                 case "update":
//                     // Handle game state updates from GameConsumer
//                     if (parsed.state) {
//                         setGameState((prev) => ({
//                             ...prev,
//                             ...parsed.state
//                         }));
//                     }
//                     break;

//                 default:
//                     console.log("Unknown message type:", parsed.type);
//             }
//         };

//         ws.onclose = (event) => {
//             if (!isCleaningUp) {
//                 console.log(`Disconnected from room ${roomId}`);
//                 if (event.code === 4001) {
//                     setShouldRedirect(true);
//                 }

//                 handleDisconnect();
//                 // setConnectionStatus('disconnected');
//             }
//         };

//         ws.onerror = (err) => {
//             if (!isCleaningUp && ws.readyState !== WebSocket.CLOSING) {
//                 console.error("WebSocket error:", err);
//                 // setConnectionStatus('error');
//             }
//         };

//         return () => {
//             isCleaningUp = true;
//             ws.close();
//         };
//     }, [roomId, user?.username, setMessages]);

//     return {wsRef, gameState, setGameState, shouldRedirect, sendGameAction, makeMove};
// }