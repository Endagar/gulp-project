'use strict';

// Require our devDependencies.
var gulp         = require('gulp'),	
	autoprefixer = require('gulp-autoprefixer'),	
	browsersync  = require('browser-sync'),
	clean 		 = require('gulp-clean'),
	concat 		 = require('gulp-concat'),
	csso 		 = require('gulp-csso'),
	imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
	plumber      = require('gulp-plumber'),
	pug 		 = require('gulp-pug'),
	rename       = require('gulp-rename'),
	sourcemaps   = require('gulp-sourcemaps'),	
	stylus 		 = require('gulp-stylus'),
	uglify       = require('gulp-uglify'),
	watch        = require('gulp-watch'),
	zip          = require('gulp-zip');
	
var reload 		 = browsersync.reload;


//
var paths = {
    dir: {
        app:    './app',
        public: './public',
        build:  './build'
    },
    watch: {
        pug:  './app/templates/**/*.pug',
        styl: './app/styles/**/*.styl',
        js:   './app/scripts/**/*.js'
    },
    app: {
        html: {
            src: './app/templates/pages/*.pug',
            dest: './public'
        },
        common: {
            css: {
                src: [
                    './app/styles/**/*.styl'
                ],
                dest: './public/assets/css'
            },
            js: {
                src: './app/scripts/**/*.js',
                dest: './public/assets/js'
            }
        },
        vendor: {
            css: {                
                dest: './public/assets/css'
            },
            js: {              
                dest: './public/assets/js'
            },
            fonts: {                
                dest: './public/assets/fonts'
            }
        }
    },
    img: {
        src: './app/images/**/*.*',
        public: './public/images',
        build: './build/assets/images'
    },
    build: {
        html: {
            src: './app/*.html',
            dest: './build'
        },
        css: {
            src: './public/assets/css/*.min.css',
            dest: './build/assets/css'
        },
        js: {
            src: './public/assets/js/*.min.js',
            dest: './build/assets/js'
        },
        fonts: {
            src: './public/assets/fonts/**/*.*',
            dest: './build/assets/fonts'
        }
    },
    clean: ['build/**/*']
};

paths.app.vendor.css = require('./app/configs/lib_css.js');
paths.app.vendor.js = require('./app/configs/lib_js.js');
paths.app.vendor.fonts = require('./app/configs/lib_fonts.js');

// BrowserSync
gulp.task('webserver', function() {
    browsersync.init({
        server: './public',
        browser: 'chrome'
    });

    gulp.watch(paths.watch.pug, gulp.series('html'));
    gulp.watch(paths.watch.styl, gulp.series('cssCommon'));
    gulp.watch(paths.watch.js, gulp.series('jsCommon'));

    /* gulp.watch('*.html').on('change', reload); */
});

// Таск для работы Pug, преобразование Pug в HTML
gulp.task('html', function () {
    return gulp.src(paths.app.html.src)
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest(paths.app.html.dest))
        .pipe(browsersync.stream());
});

// Таск для объединения и минификации CSS-файлов внешних библиотек
gulp.task('cssVendor', function () {
    return gulp.src(paths.app.vendor.css.src)
        .pipe(concat('vendor.min.css'))
        .pipe(csso())
        .pipe(gulp.dest(paths.app.vendor.css.dest));
});

// Таск для объединения и минификации JS-файлов внешних библиотек
gulp.task('jsVendor', function () {
    return gulp.src(paths.app.vendor.js.src)
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.app.vendor.js.dest));
});

// Таск для объединения папок fonts внешних библиотек
gulp.task('fontsVendor', function () {
    return gulp.src(paths.app.vendor.fonts.src)
        .pipe(gulp.dest(paths.app.vendor.fonts.dest));
});


// Таск для преобразования Stylus-файлов в CSS (Stylus to CSS conversion):
gulp.task('cssCommon', function() {
    return gulp.src(paths.app.common.css.src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('common.styl'))
        .pipe(stylus())
        .pipe(gulp.dest(paths.app.common.css.dest))
        .pipe(rename({suffix: '.min'}))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.app.common.css.dest))
        .pipe(browsersync.stream());
});

// Таск для объединения и минификации пользовательских JS-файлов
gulp.task('jsCommon', function() {
    return gulp.src(paths.app.common.js.src)
        .pipe(plumber())
        .pipe(concat('common.js'))
        .pipe(gulp.dest(paths.app.common.js.dest))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.app.common.js.dest))
        .pipe(browsersync.stream());
});

// Таск для обработки изображений (images optimization task):
gulp.task('img', function() {
    return gulp.src(paths.img.src)
        .pipe(imagemin({use: [pngquant()]}))
        .pipe(gulp.dest(paths.img.public));
});


gulp.task('clean', function() {
    return del(paths.dir.build);
});

// Таск для сборки (build task):
gulp.task('buildDev', gulp.parallel('html', 'cssCommon', 'jsCommon', 'cssVendor', 'jsVendor', 'fontsVendor'));


// Таск для формирования production-папки
gulp.task('build', function () {
    var htmlBuild = gulp.src(paths.build.html.src)
        .pipe(gulp.dest(paths.build.html.dest));
    var cssBuild = gulp.src(paths.build.css.src)
        .pipe(gulp.dest(paths.build.css.dest));
    var jsBuild = gulp.src(paths.build.js.src)
        .pipe(gulp.dest(paths.build.js.dest));
    var fontsBuild = gulp.src(paths.build.fonts.src)
        .pipe(gulp.dest(paths.build.fonts.dest));
    return htmlBuild, cssBuild, jsBuild, fontsBuild;
});

// Таск для разработки
gulp.task('default', gulp.series('buildDev', 'webserver'));

// Таск для production
gulp.task('public', gulp.series('clean', 'img', 'build'));