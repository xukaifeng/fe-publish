const process = require("process");

const message = require("./message");
/**
 * 错误处理
 * @param {*} errorInfo 错误详情
 * @param {*} msg 错误简述
 * @param {*} rollBack
 */
const errorHandle = (errorInfo, msg = "", rollBack = false) => {
  if (msg) {
    message.error(msg);
  }
  if (errorInfo) {
    console.log(errorInfo);
  }
  if (rollBack) {
    rollBack();
  }
  message.error("********** Failed 💣 **********");
  process.exit();
};

module.exports = {
  errorHandle,
};
