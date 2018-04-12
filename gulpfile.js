var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');   //处理html
var cssmin = require('gulp-minify-css');  //处理css
var cssver = require('gulp-make-css-url-version');  //css中url后面加版本号
var md5 = require("gulp-md5-plus");     //MD5修改版本号
var del = require('del');              //删除文件
var gulpSequence = require('gulp-sequence')    //任务执行顺序
var babel = require('gulp-babel')          //es6转es5
var fs = require('fs')
var vinylPaths = require('vinyl-paths');    
// var proxy = require('http-proxy-middleware')        //api跨域访问


/* S=开发环境所需 */
var browserSync = require('browser-sync').create();   //热更新
//清空es5JS文件夹
gulp.task('clearES5', function () {
    return del(["./src/es5JS/js/controller"])
})


gulp.task('babeljs', function(){
         gulp.src('./src/js/controller/**/*.js')
             .pipe(babel())
             .pipe(gulp.dest('./src/es5JS/js/controller'))
             .on('end', function () {
                 browserSync.reload()
             })
})


// 静态服务器
gulp.task('serve',['babeljs'], function() {

    // const apiProxy = proxy('/api', {
    //     target: 'http://192.168.1.132:3360',
    //     changeOrigin: true
    // })
    //
    //
    // browserSync.init({
    //     server: {
    //         baseDir: './src/',
    //         middleware: [apiProxy]
    //     }
    // })

    browserSync.init({
        port: 3600,
        server: {
            baseDir: "./src/"
        }
    });
    gulp.watch('./src/**/*.html').on("change", browserSync.reload);
    gulp.watch('./src/js/**/*.js', ['babeljs']);
    gulp.watch('./src/**/*.css').on("change", browserSync.reload);
});
/* E=开发环境所需 */


//对html文件处理
gulp.task('testHtmlmin',function () {
    var options = {
        removeComments: true,//清除HTML注释
        // collapseWhitespace: true,//压缩HTML
        // collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        // removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        // removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        // removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };

    gulp.src('./src/*.html')
        .pipe(gulp.dest('./dist'))

    return gulp.src('./src/view/**/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('./dist/viewTemp'))    
});

//对html文件加版本号
gulp.task('md5ForHtml', function () {
    return gulp.src('./dist/viewTemp/**/*.html')
        .pipe(md5(10, './dist/viewTemp/**/*.html', {
            // dirLevel : 1,
            mappingFile: 'mappingHtml.json'
        }))
        .pipe(gulp.dest('./dist/view'))

       
        
     
})


// //压缩css
// gulp.task('testCssmin', function () {
//     var options = {
//         advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
//         compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
//         keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
//         keepSpecialComments: '*'
//         //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
//     };
//     gulp.src('css/*.css')
//         .pipe(cssver())  //给css中应用的url加上版本号
//         .pipe(cssmin(options))
//         .pipe(gulp.dest('dist/css'));
// })

gulp.task('clean', function(){
    return del(['./dist', './mappingCss.json', './mappingImg.json', 'mappingJs.json', 'mappingHtml.json'])
});

//css文件处理,添加md5版本号
gulp.task('md5ForCss', function () {
    var options = {
        advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
        compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
        keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
        keepSpecialComments: '*'
        //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    };
    gulp.src('./src/css/*.css')
        // .pipe(cssver())  //给css中应用的url加上版本号
        .pipe(cssmin(options))
        .pipe(md5(10, './dist/**/*.html',{
            mappingFile: 'mappingCss.json',         //生成映射表
        }))
        .pipe(gulp.dest('./dist/css'));

    //第三方css文件不改变
    gulp.src('./src/css/lib/**/*')
        .pipe(gulp.dest('./dist/css/lib'))
});

//js文件处理，添加MD5版本号
gulp.task('md5ForJs', function () {

    gulp.src('./src/js/controller/**/*.js')
        .pipe(babel())
        .pipe(md5(10, './dist/**/*.html',{
            mappingFile: 'mappingJs.json',         //生成映射表
        }))
        .pipe(gulp.dest('./dist/js/controller'));

    //第三方css文件不改变
    gulp.src('./src/js/lib/**/*')
        .pipe(gulp.dest('./dist/js/lib'))

})

//图片处理
gulp.task('md5ForImg', function () {
    gulp.src('./src/images/**/*')

        .pipe(md5(10,['./dist/css/*.css', './dist/js/controller/**/*.js', './dist/**/*.html'],{
            mappingFile: 'mappingImg.json',         //生成映射表
        }))
        .pipe(gulp.dest('./dist/images'));
})


// db文件处理
gulp.task('db', function() {
    gulp.src('./src/db/*')
        .pipe(gulp.dest('./dist/db'))

})



//发布执行
gulp.task('publish', gulpSequence('clean','testHtmlmin',['md5ForCss','md5ForJs'],'md5ForImg','md5ForHtml','db'))



































