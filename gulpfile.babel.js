// generated on 2016-10-13 using generator-chrome-extension 0.6.1
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {
  stream as wiredep
} from 'wiredep';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
    '!app/styles.scss'
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{
          cleanupIDs: false
        }]
      }))
      .on('error', function(err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('sass', () => {
  return gulp.src('app/styles.scss/*.scss')
    .pipe($.plumber())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe(gulp.dest('app/styles'));
});

gulp.task('html', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({
      searchPath: ['.tmp', 'app', '.']
    }))
    // .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.gnirts()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss({
      compatibility: '*'
    })))
    // .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      // buildnumber: true,
      background: {
        target: 'scripts/eventPage.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
    }))
    .pipe($.if('*.css', $.cleanCss({
      compatibility: '*'
    })))
    // .pipe($.if('*.js', $.sourcemaps.init()))
    .pipe($.if('*.js', $.gnirts()))
    .pipe($.if('*.js', $.uglify()))
    // .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist'));
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel/**/*.js')
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('app/scripts'));
});

// TODO: this should be automatic
gulp.task('scripts', () => {
  return gulp.src(['app/scripts/search.js',
       'app/scripts/item.js',
       'app/scripts/checkout.js',
       'app/scripts/viewall.js',
       'app/scripts/header.js'])
    .pipe($.gnirts())
    .pipe($.uglify())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('libs', () => {
  return gulp.src('app/libs/**/*.*')
    .pipe(gulp.dest('dist/libs'));
});

gulp.task('bower', () => {
  return $.bower();
});

gulp.task('dependencies', () => {
  var sjcl = gulp.src('app/bower_components/sjcl/sjcl.js')
    .pipe(gulp.dest('app/libs/js/sjcl'));
  var jquery = gulp.src('app/bower_components/jquery/dist/jquery.min.*')
    .pipe(gulp.dest('app/libs/js/jquery'));

  return $.merge(sjcl, jquery);
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['bower', 'dependencies', 'lint', 'babel'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
  gulp.watch('app/styles.scss/**/*.scss', ['sass']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('wiredep', () => {
  gulp.src('app/styles.scss/*.scss')
    .pipe(wiredep({
      //ignorePath: /^(\.\.\/)+/
      //ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/styles.scss'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', () => {
  var manifest = require('./dist/manifest.json');
  return gulp.src(['dist/**', '!**/*.js.map'])

  // packer doesn't work
  // .pipe($.if('scripts/options.js', $.streamify($.packer({base62: true, shrink: false}))))
  // .pipe($.if('scripts/options.min.js', $.rename((path) => {
  //   path.basename = path.basename.replace(".min", "");
  //   return path;
  // })))
  // .pipe($.closureCompiler({
  //    // compilerPath: 'bower_components/closure-compiler/compiler.jar',
  //    fileName: 'build.js',
  //    compilerFlags: {
  //      closure_entry_point: 'app.main',
  //      compilation_level: 'ADVANCED_OPTIMIZATIONS',
  //      only_closure_dependencies: true,
  //      warning_level: 'VERBOSE'
  //    }
  //  }))
  .pipe($.zip('AutoCopper-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(
    'lint', 'babel', 'bower', 'dependencies', 'sass', 'scripts', 'libs',
    'chromeManifest', ['html', 'images', 'extras'], 'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
