var { src, dest, task, watch, series, parallel } = require('gulp');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');

// 任务 sass：编译css文件夹下所有.scss文件
task("sass", function () {
    return src('css/*.scss')
        .pipe(sass())
        .pipe(cleanCss())
        .pipe(dest('css'));
});
// 任务 watch:sass：监听目录下所有sass文件，单个触发编译
task('watch:sass', function () {
    const watcher = watch('css/*.scss');
    // 事件：'add', 'addDir', 'change', 'unlink', 'unlinkDir', 'ready', 'error', or 'all'全部事件
    watcher.on('all', function (event, path) {
        path = path.replace(/\\/g, '/');
        src(path)
            .pipe(sass())
            .pipe(cleanCss())
            .pipe(dest('css'));
    });
});
// 一个任务启动多个任务 series 依次执行 parallel 是并发执行
// task('sass-all', series('sass-test', 'sass-test2'));
// 执行scss编译监听      gulp watch:sass