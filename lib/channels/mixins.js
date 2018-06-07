const debug = require('debug')('@feathersjs/transport-commons:channels/mixins');
const Channel = require('./channel/base');
const CombinedChannel = require('./channel/combined');

const PUBLISHERS = Symbol('@feathersjs/transport-commons/publishers');
const CHANNELS = Symbol('@feathersjs/transport-commons/channels');
const ALL_EVENTS = Symbol('@feathersjs/transport-commons/all-events');

exports.keys = {
  PUBLISHERS,
  CHANNELS,
  ALL_EVENTS
};

exports.channelMixin = function channelMixin () {
  return {
    [CHANNELS]: {},

    channel (...names) {
      debug('Returning channels', names);

      if (names.length === 0)
        throw new Error('app.channel needs at least one channel name');

      if (Array.isArray(names)) {
        let name = Array.isArray(names[0]) ? names[0] : names;

        let channels = name.map(e => {
          return this[CHANNELS][e] || (this[CHANNELS][e] = new Channel());
        });

        return new CombinedChannel(channels);
      }
      else
        return this[CHANNELS][names] || (this[CHANNELS][names] = new Channel());
      
    }
  };
};

exports.publishMixin = function publishMixin () {
  return {
    [PUBLISHERS]: {},

    publish (event, callback) {
      debug('Registering publisher', event);

      if (!callback && typeof event === 'function') {
        callback = event;
        event = ALL_EVENTS;
      }

      if (this._serviceEvents && event !== ALL_EVENTS && this._serviceEvents.indexOf(event) === -1) {
        throw new Error(`'${event}' is not a valid service event`);
      }

      const publishers = this[PUBLISHERS];

      publishers[event] = callback;

      return this;
    }
  };
};
