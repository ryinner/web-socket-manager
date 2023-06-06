# WebSocketManager

That a simple webSocket wrapper.

## Install

```bash
npm install @ryinner/web-socket-manager --save
```

## Usage

```typescript
const ws = new WebSocketManager('your wss');

// add operation
// if you add same operation, its handler will add to operation handlers.
ws.addOperation(
    'method',
    (WebSocketInstance) => {
        webSocketInstance.send(JSON.stringify({ method: 'method', data: { myFieldToWebSocket: 1 } }))
    },
    (answerFromServer) => {
        // smth
    }
);

// remove operation
ws.removeOperation('method');

//remove handler
ws.removeHandler('method', handler);

// start websocket
ws.start();

// close websocket
ws.stop();
```

## Server answer

Manager expect this server answer format.

```json 
{
    "method": "methodName",
    "data": {
        "someDataField": 1
    }
}
```