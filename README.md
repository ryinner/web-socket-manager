# WebSocketManager

That a simple webSocket wrapper.

## Install

```bash
npm install @ryinner/web-socket-manager --save
```

## Usage

```typescript
//Only one ws
const ws = createWebSocket({ url: 'url' });

// add operation - interval server request
// if you add same operation, its handler will add to operation handlers.
ws.addOperation<MyAnswerInterface>({
    method: 'method',
    request: () => {
        const computed = 1;
        return { myFieldToWebSocket: computed };
    },
    handlers: [
        (answerFromServer) => {
            // smth
        }
    ]
});

// remove operation
ws.removeOperation('method');

//remove handler
ws.removeHandler('method', handler);

// start websocket
ws.open();

// close websocket
ws.close();

// also you can use it in multiply mode
const wsList = createWebSocket({ base: { url: 'url' }, interval: { url: 'url2', additionalQueryParams: { secret_key: 123 }, interval: 3000 } });

// get wsManager
wsList.getConnection('base');

const handler = (answerFromServer) => {
    // smth
};

// push operation to base
wsList.addOperation('base', {
    method: 'method',
    request: () => {
        const computed = 1;
        return { myFieldToWebSocket: computed };
    },
    handlers: [
        handler
    ]
});
// remove handler
wsList.removeHandler('test', 'method', handler);
// remove operation
wsList.removeOperation('test', 'method');
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