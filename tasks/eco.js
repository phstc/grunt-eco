/*
 * grunt-eco
 * https://github.com/gr2m/grunt-eco
 *
 * Copyright (c) 2012 Gregor Martynus
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var path = require('path'),
      eco = require('eco');

  var compile = function(src, options) {
    var input = grunt.file.read(src),
        output = '',
        JSTpath = path.dirname(src) + '/' + path.basename(src, '.eco');

    // dirty Gee Hack!
    JSTpath = JSTpath.replace(/app\/scripts\/views\//, '')

    if (input.length < 1) {
      if (options.emptyWarning) {
        grunt.log.warn('Template ' + src.cyan + ' not compiled because file is empty.');
      }

      return false;
    }

    try {
      output = eco.compile(grunt.file.read(src)).replace(/module\.exports/, '');
    } catch (e) {
      grunt.log.error("Error in " + src + ":\n" + e);
      return false;
    }

    if (options.amd) {
      output = 'define(function(){\n' +
      '  var template' + output + '\n' +
      '  return template;\n' +
      '});\n';
    } else {
      output = 'window.JST["' + JSTpath + '"]' + output + '\n';

      if (options.jstGlobalCheck) {
        output = "if (!window.JST) {\n  window.JST = {};\n}\n" + output;
      }
    }

    return output;
  };


  grunt.registerMultiTask('eco', 'Compile Embedded CoffeeScript Templates', function() {
    var options = this.options({
      amd: false,
      emptyWarning: true,
      jstGlobalCheck: true
    });

    if (options.basePath) {
      grunt.fail.warn('basePath is no longer supported. please refer to README.');
    }

    this.files.forEach(function(file) {
      var destFile = path.normalize(file.dest);
      var srcFiles = file.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      var compiled = [];
      srcFiles.forEach(function(src) {
        var res = compile(src, options);

        // Gee Hack!
        if (res) {
          // compiled.push(res);
          grunt.file.write(src.replace(/^app/, '.tmp') + '.js', res);
        }
      });

      // Gee Hack!
      // if (compiled.length) {
      //   grunt.file.write(destFile, compiled.join(grunt.util.normalizelf(grunt.util.linefeed)));
      //   grunt.log.writeln('File ' + destFile.cyan + ' created.');
      // }
    });

  });

};
