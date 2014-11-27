mu    = require '../../libs/mqtt/util'
mosca = require '../../libs/vendor/mosca'
joi   = require 'joi'
describe 'MQTT util.parse_config', ->
  it 'redis', ->
    config =
      host: 'localhost'
      port: 1883
      backend: 'redis://localhost:6379'

    out = mu.parse_config(config)

    expect(out.backend).to.deep.equal
      type: 'redis'
      host: 'localhost'
      port: '6379'
      return_buffers: true
      password: null
    expect(out.host).to.equal 'localhost'
    expect(out.port).to.equal 1883

  it 'memory', ->
    config =
      backend: 'memory'

    out = mu.parse_config(config)
    expect(out.backend).to.be.undefined

describe 'MQTT util.validate', ->
  describe 'schema is true', ->
    it 'returns the given obj', ->
      out = mu.validate 1, true
      expect(out).to.equal 1

  describe 'schema is function', ->
    it 'returns the value from the function', ->
      out = mu.validate 1, (obj) ->
        obj * 2
      expect(out).to.equal 2

  describe 'schema is a joi schema', ->
    before ->
      @schema =
        a: joi.number().integer().required()
        b: joi.string()

    it 'returns the validated value', ->
      out = mu.validate
        a: 1
        b: 'Hi'
      , @schema

      expect(out).to.deep.equal
        a: 1
        b: 'Hi'

    it 'casts values if possible', ->
      out = mu.validate
        a: '2'
      , @schema

      expect(out).to.deep.equal
        a: 2

    it 'raises error if invalid', ->
      fn = =>
        out = mu.validate
          b: '2'
        , @schema

      expect(fn).to.throw Error, /a is required/

