var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
//var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
let uglify = require('gulp-uglify-es').default;
var watch = require('gulp-watch');
var babel = require('gulp-babel');

gulp.task('stream', function() {
	return watch('sass/**/*.scss', ['styles']).pipe(gulp.dest('build'));
	return watch('js/**/*.js', ['lint']).pipe(gulp.dest('build'));
	return watch('/index.html', ['copy-html']).pipe(gulp.dest('build'));
	return watch('./dist/index.html').on('change', browserSync.reload);

	
});




gulp.task('styles', function(){
	return gulp.src('sass/**/*.scss')
	.pipe(sass({
		outputStyle: 'compressed'
	}).on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(gulp.dest('dist/css'))
	.pipe(browserSync.stream());

});

gulp.task('scripts', function() {
	return gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
	return gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	return gulp.src('./*.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	return gulp.src('images/*')
		.pipe(gulp.dest('dist/images'));
});

gulp.task('lint', function () {
	return gulp.src(['js/**/*.js'])
		// eslint() attaches the lint output to the eslint property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failOnError last.
		.pipe(eslint.failOnError());
});

