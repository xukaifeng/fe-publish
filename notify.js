const notifier = require("node-notifier");

// https://www.npmjs.com/package/node-notifier
const success = (title, options = {}) => {
  notifier.notify("Message");
  notifier.notify({
    title: title || "发布成功",
    ...options,
  });
};

const error = (message, options = {}) => {
  notifier.notify({
    title: "发布失败",
    message,
    ...options,
  });
};

module.exports = {
  success,
  error,
};
