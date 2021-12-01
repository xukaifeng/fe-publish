const path = require("path");
const archiver = require("archiver");
const fs = require("fs");
const node_ssh = require("node-ssh");
const ssh = new node_ssh();
const srcPath = path.resolve(__dirname, "../../dist");
const configs = require("./config");

console.log("开始压缩dist目录...");
startZip();

//压缩dist目录为public.zip
function startZip() {
  var archive = archiver("zip", {
    zlib: { level: 5 }, //递归扫描最多5层
  }).on("error", function (err) {
    throw err; //压缩过程中如果有错误则抛出
  });

  var output = fs.createWriteStream(__dirname + "/public.zip").on("close", function (err) {
    /*压缩结束时会触发close事件，然后才能开始上传，
          否则会上传一个内容不全且无法使用的zip包*/
    if (err) {
      console.log("关闭archiver异常:", err);
      return;
    }
    console.log("已生成zip包");
    console.log("开始上传public.zip至远程机器...");
    uploadFile();
  });

  archive.pipe(output); //典型的node流用法
  archive.directory(srcPath, "/public"); //将srcPach路径对应的内容添加到zip包中/public路径
  archive.finalize();
}

//将dist目录上传至正式环境
function uploadFile() {}
