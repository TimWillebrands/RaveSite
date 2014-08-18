'use strict'; /*jslint node: true, es5: true, indent: 2 */
var util = require('util');

var Logger = function() {
  /** Logger

  this._level is always a Number (default: 0)
  It is set via this.level, as either a string (resolved using Logger._levels) or integer.

  this.stream should implement .write(string), like any instance of stream.Writable (default: process.stderr)

  Logger._levels is a mapping from level names (Strings) to level values (Numbers).

  */
  this._level = 0;
  this.stream = process.stderr;
};
Logger.prototype.set = function(opts) {
  /** Little configuration helper so that you can write:

  var logger = require('loge').set({level: 'warn'});
  */
  if (opts.level !== undefined) {
    // call the setter:
    this.level = opts.level;
  }
  if (opts.stream !== undefined) {
    this.stream = opts.stream;
  }
  return this;
};

Object.defineProperty(Logger.prototype, 'level', {
  /** logger.level returns a String if the current threshold (logger._level) has a matching name in Logger._levels.
  Otherwise, returns the underlying Number representation.

  If logger.level is set to a String that is not a key in Logger._levels, logger._level will default to 0.
  If logger.level is set to a Number, logger._level is set to exactly that value.
  */
  get: function() {
    for (var level_name in Logger._levels) {
      if (Logger._levels[level_name] == this._level) {
        return level_name;
      }
    }
    return this._level;
  },
  set: function(value) {
    if (typeof(value) == 'number') {
      this._level = value;
    }
    else {
      this._level = Logger._levels[value] || 0;
    }
  },
});

Object.defineProperty(Logger, 'levels', {
  get: function() {
    return this._levels;
  },
  set: function(levels) {
    this._levels = levels;
    // and add the helper functions:
    Object.keys(levels).forEach(function(level_name) {
      var level_value = levels[level_name];
      Logger.prototype[level_name] = function(/* arguments */) {
        // `this` will be bound as the Logger instance
        if (level_value >= this._level) {
          // var args = arguments; // Array.prototype.slice(arguments);
          var text = util.format.apply(null, arguments);
          this.stream.write('[' + level_name + '] ' + text + '\n');
        }
      };
    });
  },
});
// set defaults
Logger.levels = {
  // for keys with the same value, the first key is canonical
  silly: 5,
  debug: 10,
  verbose: 10,
  info: 20,
  warn: 30,
  warning: 30,
  error: 40,
  critical: 50,
};

module.exports = new Logger();
