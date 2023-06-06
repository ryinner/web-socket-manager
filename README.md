# WebSocketManager

That a simple webSocket wrapper.

## Install

```bash
npm install @ryinner/web-socket-manager --save
```

## Usage

```typescript
const ws = new WebSocketManager('your wss');

// add operation - interval server request
// if you add same operation, its handler will add to operation handlers.
ws.addOperation(
    'method',
    () => {
        const computed = 1;
        return { myFieldToWebSocket: computed };
    }, // send message { method: 'method', data: { myFieldToWebSocket: 1 } };
    (answerFromServer) => {
        // smth
    }
);

// send message - if you want send one message
ws.sendMessage('method', {data: 'data'}, (answer) => { console.log(answer); });

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