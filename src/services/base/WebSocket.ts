
let socket;
export function openWebsocketForConversation(projectId: string, onWebsocketMessage: (result: string[]) => void, iteration = 0) {
    if (iteration > 5) {
        console.error("Websocket could not be opened");
        return;
    }
    //user is collected from kratos    
    if (socket) {
        console.error("Socket already open -> closing it and opening a new one");
        closeWebsocket();
    }

    const wsUrl = findWebsocketAddress()
    const newSocket = new WebSocket(wsUrl);
    newSocket.onerror = (error) => console.error("WebSocket Error: ", error);
    newSocket.onopen = (event) => console.log("WebSocket connection opened")
    newSocket.onclose = (event) => {
        socket = null;
        if (!event.wasClean) {
            console.log('WebSocket connection closed with error -> trying to reconnect');
            openWebsocketForConversation(projectId, onWebsocketMessage, iteration + 1);
        }
    };

    newSocket.onmessage = (event) => {
        const dataArr = event.data.split(":");
        // if (dataArr[0] == "close") closeWebsocket();
        // else 
        onWebsocketMessage(dataArr);

    };
    socket = newSocket;
}

function findWebsocketAddress() {
    return 'ws://localhost:4455/notify/ws';
    let address = window.location.protocol == 'https:' ? 'wss:' : 'ws:';
    address += '//' + window.location.host + '/notify/ws';
    return address; //'ws://localhost:4455/notify/ws'
}

export function closeWebsocket() {
    if (!socket) return;
    socket.close();
    socket = null;
}
