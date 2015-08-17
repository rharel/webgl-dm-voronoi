/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

module.exports = function(grunt) {

  config = {
    pkg: grunt.file.readJSON('package.json'),
    src_dir: 'src/',
    test_dir: 'test/',
    dist_dir: 'dist/',
    demo_dir: 'demo/',

    jshint: {
      src: [
        '<%= src_dir %>**/*.js'
      ],

      all: [
        '<%= src_dir %>**/*.js',
        '<%= demo_dir %>**/*.js'
      ]
    },

    clean: {
      dist: {
        src: [
          '<%= dist_dir %>/*.js'
        ]
      }
    },

    copy: {
      release: {
        expand: true,
        cwd: '<%= src_dir %>',
        src: ['**/*.js'],
        dest: '<%= temp_dir %>',
        flatten: true,
        filter: 'isFile',
        options: {
          process: function(content) {
            var headerEnd = '*/';
            var i = content.indexOf(headerEnd);
            return content.slice(i + headerEnd.length);
          }
        }
      }
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '/**\n' +
                ' * @author Raoul Harel\n' +
                ' * @license The MIT license (LICENSE.txt)\n' +
                ' * @copyright 2015 Raoul Harel\n' +
                ' * @url https://github.com/rharel/webgl-dm-voronoi\n' +
                '*/\n\n',
        separator: '\n\n'
      },

      release: {
        src: [
          '<%= src_dir %>/extensions.js',
          '<%= src_dir %>/core/*.js',
          '<%= src_dir %>/sites/SIte.js',
          '<%= src_dir %>/sites/PointSite.js',
          '<%= src_dir %>/exports.js'
        ],
        dest: '<%= dist_dir %>/voronoi.js'
      }
    },

    wrap: {
      release: {
        src: '<%= dist_dir %>/voronoi.js',
        dest: '<%= dist_dir %>/voronoi.js',
        options: {
          wrapper: ['(function() {', '})();'],
          separator: '\n\n',
          indent: '  '
        }
      }
    },

    uglify: {
      release: {
        files: {
          '<%= dist_dir %>/voronoi.min.js': ['<%= dist_dir %>/voronoi.js']
        }
      }
    }
  };

  grunt.registerTask('build', [
    'clean:dist',
    'concat:release',
    'wrap:release'
  ]);
  grunt.registerTask('minify', 'uglify:release');
  grunt.registerTask('dev', [
    'jshint:all',
    'build'
  ]);
  grunt.registerTask('release', [
    'jshint:all',
    'build',
    'minify'
  ]);
  grunt.registerTask('default', 'dev');

  require('load-grunt-tasks')(grunt);

  return grunt.initConfig(config);
};