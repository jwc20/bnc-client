

import { useEffect, useState } from "react";
import { connection$, messages$ } from "../hooks/useRoomWebSocket";

export const TestWebSocket = ({ roomId }) => {
    console.log(roomId);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const sub = messages$.subscribe((msg) => {
            console.log(msg);
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();

        connection$.next(message);
        setMessage("");
    };

    return (
        <div>
            <h1>TestWebSocket</h1>
            <form onSubmit={sendMessage}>
                <input
                    onChange={(e) => {
                        setMessage(e.target.value);
                    }}
                    type="text"
                    value={message}
                />
                <button type="submit">Send</button>
            </form>
        </div>
        
    );
};





