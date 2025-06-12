### Mediasoup State Architecture (server)

```json
{
  "worker": "workerObject",
  "room" => {
    "roomId1": {
      "worker": "workerReference",
      "router": "routerObject",
      "peers" => { // contains all the peer data
        "peerId1": {
          "userId": "string",
          "transports": ["transportId1", "transportId2"],
          "producers": ["producerId1", "producerId2"],
          "consumers": ["consumerId1", "consumerId2"]
        },
        "peerId2": {
          // ...
        }
      },
      "transports" => {
        "transportId1": "transportObject"
      },
      "producers" => {
        "producerId1": "producerObject"
      },
      "consumers" => {
        "consumerId1": "consumerObject"
      },
      "peerConsumers" => {
        "peerId1": ["producerIdA", "producerIdB"] // contains producerIds which the peer has consumed
      }
    },
    "roomId2": {
      // ...
    }
  }
}
```
