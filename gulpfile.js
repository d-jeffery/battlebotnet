let gulp = require("gulp");
let butternut = require("gulp-butternut");
let pump = require("pump");

gulp.task("compress", function(cb) {
  pump(
    [
      gulp.src("src/public/*.ts"),
      butternut({ sourceMap: true }),
      gulp.dest("public")
    ],
    cb
  );
});
