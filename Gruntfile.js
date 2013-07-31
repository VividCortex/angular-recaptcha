module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' +
                ' * <%= pkg.name %> build:<%= grunt.template.today("yyyy-mm-dd") %> \n' +
                ' * <%= pkg.homepage %> \n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> VividCortex \n' +
                '**/\n\n'
        },
        concat: {
            options: { banner: '<%= meta.banner %>' },
            dist_js: {
                src: [
                    '<banner>',
                    'src/module.js',
                    'src/service.js',
                    'src/directive.js'
                ],
                dest: 'release/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: { banner: '<%= meta.banner %>' },
            release: {
                src:  'release/<%= pkg.name %>.js',
                dest: 'release/<%= pkg.name %>.min.js'
            }
        }
    });

    // Load the plugin that provides the needed tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};
