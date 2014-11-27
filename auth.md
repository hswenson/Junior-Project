# Auth/ACL
## Prerequisites
1. Set up MQTT over SSL

## Terminology
linked - An iOS app is linked to a device if it has permission to pub/sub to device.

## Topic ACL
1. products/{deviceId}/{param}
  - Only given device can subscribe to topic.
  - Only linked apps can publish to topic.
2. api/{deviceId}/log
  - Only given device can publish to topic.
  - Only linked apps can subscribe.

## Requirements
1. Someone with physical access to the device can revoke all linked apps (e.g press a small button on the back).
2. Multiple apps can be linked to a mirror at a time.
3. The linking of a new app to a device does not revoke other apps that are linked to the device.
4. The app can revoke its own permission, but cannot revoke other apps permission.

# Use cases
1. First time setup
  - Device creates and stores a random token to be used as a password.
  - WIFI on device setup via smartconfig
    - in the service discovery message the device directly sends its deviceId and token to the app.
    - the app uses these credentials to gain permission for the device.
    - device also sends these credentials to the server
      - for extra security credentials can be signed (e.g. JWT or other HMAC) with a preshared key, this would make it more difficult for someone to impersonate a device.
2. Link another app
  - User pushes button on device (similar to WPS)
  - Device notifies server that it is open to access for the next 90 seconds.
    - Depending on the accuracy of the CC3200 clock, this could be implemented with TOTP (like google authenticator).
  - Any request to link to the device for the next 90 seconds is granted.
3. Revoke all linked apps
  - Press reset button on device, reset random token and send to server.
