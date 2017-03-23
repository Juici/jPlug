import gulp from 'gulp';

gulp.task('watch', (done) => {
    const watcher = gulp.watch('src/**/*.{scss,js}', gulp.parallel('build'));

    watcher.on('change', (evt) => {
        console.log(`File ${evt.path} was ${evt.type}, running build task...`);
    });
});
