module.exports = function (grunt) {

  grunt.initConfig({
    concat: {
      dist: {
        options: {
          banner: "(function (){\n  'use strict';",
          footer: "})();\n",
          process: function (src) {
            var processedSrc = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");/g, '');
            processedSrc     = processedSrc.replace(/(\(function\s*\(\)\s*\{)/, '');
            processedSrc     = processedSrc.replace(/(\}\)\(\));/, '');
            return processedSrc;
          }
        },
        files  : {
          'kt-angular-dropdown.standalone.js': [
            'bower_components/kt-angular-util/js/components/dom.js',
            'kt-angular-dropdown.js'
          ]
        }
      }
    },
    sass: {
      options: {
        outputStyle: 'expanded',
        sourceMap  : true
      },
      dist: {
        files: {
          'kt-angular-dropdown.css': 'scss/kt-angular-dropdown.scss'
        }
      }
    },
    postcss: {
      options: {
        map: {
          inline: true
        },

        processors: [
          require('autoprefixer')({browsers: 'last 3 versions'})
        ]
      },
      dist: {
        src: 'kt-angular-dropdown.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');

  grunt.registerTask('default', ['sass', 'postcss']);
};
