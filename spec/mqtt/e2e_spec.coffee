initialize = require '../../libs/initialize.js'
mqtt = require 'mqtt'
async = require 'async'
mqtt_util = require '../../libs/mqtt/util'
util = require '../../libs/util'
_ = require 'lodash'

# TODO - I should be able to require models without initializing database.
Storage = null
Device = null

before (done) ->
  @timeout 10000
  initialize.initApp =>
    initialize.injectData =>
      initialize._app.startServers()
      {Storage, Device} = require '../../models'
      @server = initialize._mqtt.server
      console.log '\n\n'
      done()

describe 'api/{deviceId}/log', ->
  beforeEach ->
    opts = @server.opts
    @client = mqtt.createClient(opts.port, opts.host)

  afterEach ->
    @client.end()

  describe 'Valid Device', ->
    before (done) ->
      @device_id = '1'
      # Make sure this device exists
      Device.make(@device_id, '123456').save (err) ->
        done()

    describe 'Valid with requestId', ->
      beforeEach ->
        @publish_valid = (payload, cb) ->
          @client
            .subscribe 'api/1/ack'
            .subscribe 'api/error'
            .on 'message', (topic, message) ->
              expect(topic).to.equal 'api/1/ack'
              msg = JSON.parse message
              expect(msg.response).to.have.keys 'deviceId', '_id', 'result', 'uSec'
              expect(msg.requestId).to.equal 1
              expect(msg.topic).to.equal 'api/1/log'
              cb(topic, msg)
            .publish 'api/1/log', payload

      it 'sends a msg to api/{deviceId}/ack', (done) ->
        payload = JSON.stringify
          batteryLife: 1
          requestId: 1

        @publish_valid payload, (topic, msg) ->
          done()

      it 'fixes double quoted json', (done) ->
        payload = JSON.stringify
          batteryLife: 1
          requestId: 1
        payload = "'#{payload}'"
        @publish_valid payload, (topic, msg) ->
          done()

    describe 'Errors', ->
      beforeEach ->
        @publish_error = (topic, message, cb) ->
          @client
            .subscribe 'api/error'
            .on 'message', (err_topic, msg) ->
              msg = JSON.parse(msg)
              expect(msg.topic).to.equal topic
              expect(msg.payload).to.equal message
              cb err_topic, msg
            .publish topic, message

      it 'requires valid json', (done) ->
        @publish_error 'api/1/log', 'a', (topic, msg) ->
          expect(msg.name).to.equal 'SyntaxError'
          done()

      it 'requires the payload to deserialize to an object', (done) ->
        @publish_error 'api/1/log', '1', (topic, msg) ->
          expect(msg.name).to.equal 'Error'
          expect(msg.message).to.equal 'payload must deserialize to object'
          done()

      it 'requires the deviceId to belong to a valid device', (done) ->
        valid = JSON.stringify
          batteryLife: 1
          requestId: 1
        @publish_error 'api/nonexistant/log', valid, (topic, msg) ->
          expect(msg.name).to.equal 'Error'
          expect(msg.message).to.equal 'Device with id = nonexistant is not registered'
          done()
