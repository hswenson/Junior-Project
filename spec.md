# MQTT
## Topics
### 1. ```products/{deviceId}/{parameter}```
- client subscribes to topic
- on subscription client receives the last retained value
- app/server publishes with QOS=1, RETAIN=1

### 2. ```api/{deviceId}/log```
- client publishes to topic with QOS=1
- server subscribes and saves logged data
- message must be json
  - e.g. {"batteryLife": 1, "temp": 2}
  - if "requestId" is included in message, when data is successfully stored, the server publishes to the ```api/{deviceId}/ack``` topic.

### 3. ```api/{deviceId}/ack``` [debug only]
- server publishes to acknowledge successful save
- only sent if message has a requestId
- message is json
  - e.g. {"topic": "api/Mirror1/log", "requestId": 123, "response": {"_id": "54094d1637dc10b188b43b1e", "result": 1, "uSec": 1409895702 }}


### 3. ```api/error``` [debug only]
- server publishes when their is an error
- message is json


# HTTP
## Endpoints
### /api/register
### /api/publish/
- params
  - topic
  - message
  - qos
  - retain
