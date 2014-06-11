var gulp = require("gulp");
var fileImports = require("gulp-imports");
var header = require("gulp-header");
var beautify = require("gulp-beautify");
var hintNot = require("gulp-hint-not");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var plato = require("gulp-plato");
var gutil = require("gulp-util");
var express = require("express");
var path = require("path");
var pkg = require("./package.json");
var open = require("open");
var port = 3080;

var banner = ["/**",
    " * <%= pkg.name %> - <%= pkg.description %>",
    " * Author: <%= pkg.author %>",
    " * Version: v<%= pkg.version %>",
    " * Url: <%= pkg.homepage %>",
    " * License(s): <% pkg.licenses.forEach(function( license, idx ){ %><%= license.type %><% if(idx !== pkg.licenses.length-1) { %>, <% } %><% }); %>",
    " */",
    ""
].join("\n");

gulp.task("combine", ["combine.monologue"]);

gulp.task("combine.monologue", function() {
    return gulp.src(["./src/monologue.js"])
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(fileImports())
        .pipe(hintNot())
        .pipe(beautify({
            indentSize: 4,
            preserveNewlines: false
        }))
        .pipe(gulp.dest("./lib/"))
        .pipe(uglify({
            compress: {
                negate_iife: false
            }
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename("monologue.min.js"))
        .pipe(gulp.dest("./lib/"));
});

gulp.task("default", ["combine"]);

gulp.task("report", function() {
    return gulp.src("./lib/monologue.js")
        .pipe(plato("report"));
});

var createServer = function(port) {
    var p = path.resolve("./");
    var app = express();
    app.use(express.static(p));
    app.listen(port, function() {
        gutil.log("Listening on", port);
    });

    return {
        app: app
    };
};

var servers;

gulp.task("server", ["combine", "report"], function() {
    if (!servers) {
        servers = createServer(port);
    }
    open("http://localhost:" + port + "/index.html");
});