module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-openui5');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        openui5_preload: {
            component: {
                options: {
                    resources: {
                        cwd: 'Webapp',
                        prefix: 'sap/crypto/app',
                        compress: true,
                        src: [
                               '**/*.js',
                               '**/*.html',
                               '**/*.css'
                             ]
                    },
                    dest: '.'
                },
                components: true
            }
        }
    });

};
