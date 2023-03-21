module.exports = function(grunt) {
    "use strict"

    var banner =
        "/*\n" +
        " * jsGrid v<%= pkg.version %> (<%= pkg.homepage %>)\n" +
        " * (c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>\n" +
        " * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n" +
        " */\n";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        copy: {
            imgs: {
                expand: true,
                cwd: "css/",
                src: "*.png",
                dest: "dist/"
            },
            i18n: {
                expand: true,
                cwd: "src/i18n/",
                src: "*.js",
                dest: "dist/i18n/",
                rename: function(dest, src) {
                    return dest + "jsgrid-" + src;
                }
            },
            src: {
                expand: true,
                cwd: "src/",
                src: "jsgrid-theme-bootstrap.js",
                dest: "dist/"
            }
        },

        concat: {
            options: {
                banner: banner + "\n",
                separator: "\n"
            },
            js: {
                src: [
                    "src/jsgrid.core.js",
                    "src/jsgrid.load-indicator.js",
                    "src/jsgrid.load-strategies.js",
                    "src/jsgrid.sort-strategies.js",
                    "src/jsgrid.validation.js",
                    "src/jsgrid.field.js",
                    "src/fields/jsgrid.field.text.js",
                    "src/fields/jsgrid.field.number.js",
                    "src/fields/jsgrid.field.textarea.js",
                    "src/fields/jsgrid.field.select.js",
                    "src/fields/jsgrid.field.checkbox.js",
                    "src/fields/jsgrid.field.control.js",
                    "src/fields/jsgrid.field.spacer.js"
                ],
                dest: "dist/<%= pkg.name %>.js"
            },
            css1: {
                src: "css/jsgrid.css",
                dest: "dist/<%= pkg.name %>.css"
            },
            css2: {
                src: "css/jsgrid-compact.css",
                dest: "dist/<%= pkg.name %>-compact.css"
            },
            theme1: {
                src: "css/theme.css",
                dest: "dist/<%= pkg.name %>-theme.css"
            },
            theme2: {
                src: "css/theme-compact.css",
                dest: "dist/<%= pkg.name %>-theme-compact.css"
            },
            theme3: {
                src: "css/theme-bootstrap.css",
                dest: "dist/<%= pkg.name %>-theme-bootstrap.css"
            }
        },

        "string-replace": {
            version: {
                files: [{
                    src: "<%= concat.js.dest %>",
                    dest: "<%= concat.js.dest %>"
                }],
                options: {
                    replacements: [{
                        pattern: /"@VERSION"/g,
                        replacement: "'<%= pkg.version %>'"
                    }]
                }
            }
        },

        imageEmbed: {
            options: {
                deleteAfterEncoding : true
            },
            theme1: {
                src: "<%= concat.theme1.dest %>",
                dest: "<%= concat.theme1.dest %>"
            },
            theme2: {
                src: "<%= concat.theme2.dest %>",
                dest: "<%= concat.theme2.dest %>"
            }
        },

        uglify: {
            options : {
                banner: banner + "\n"
            },
            js: {
                src: "<%= concat.js.dest %>",
                dest: "dist/<%= pkg.name %>.min.js"
            },
            js1:{
                src: "src/jsgrid-theme-bootstrap.js",
                dest: "dist/jsgrid-theme-bootstrap.min.js"
            }
        },

        cssmin: {
            options : {
                banner: banner
            },
            css1: {
                src: "<%= concat.css1.dest %>",
                dest: "dist/<%= pkg.name %>.min.css"
            },
            css2: {
                src: "<%= concat.css2.dest %>",
                dest: "dist/<%= pkg.name %>-compact.min.css"
            },
            theme1: {
                src: "<%= concat.theme1.dest %>",
                dest: "dist/<%= pkg.name %>-theme.min.css"
            },
            theme2: {
                src: "<%= concat.theme2.dest %>",
                dest: "dist/<%= pkg.name %>-theme-compact.min.css"
            },
            theme3: {
                src: "<%= concat.theme3.dest %>",
                dest: "dist/<%= pkg.name %>-theme-bootstrap.min.css"
            }
        },

        qunit: {
            files: ["tests/index.html"]
        }

    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify-es");
    grunt.loadNpmTasks("grunt-image-embed");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask("default", ["copy", "concat", "string-replace", "imageEmbed", "uglify", "cssmin"]);

    grunt.registerTask("test", "qunit");
};
