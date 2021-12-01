const process = require("process");

const message = require("./message");
/**
 * 错误处理
 * @param {*} errorInfo 错误详情
 * @param {*} msg 错误简述/标题
 * @param {*} rollBack
 */
const errorHandle = (errorInfo, title = "", rollBack = false) => {
  if (rollBack) {
    rollBack();
  }
  if (title) {
    message.error(title);
  }
  if (errorInfo) {
    console.log(errorInfo);
  }
  message.error("********** Failed 💣 **********");
  process.exit();
};

module.exports = {
  errorHandle,
};
