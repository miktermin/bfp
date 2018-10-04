var gulp = require('gulp'),
	browserSync = require('browser-sync').create();

gulp.task('serve', function () {
	browserSync.init({
		server: { baseDir: './' }
	});
	
	gulp.watch(['index.html']).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);