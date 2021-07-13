#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const process = require("process");
const child_process = require("child_process");

const ora = require("ora");
const commander = require("commander");
const inquirer = require("inquirer");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

const run = require("./run");
const message = require("./message");

const configPath = path.join(process.cwd(), "dtstack.config.js");
console.log(`${configPath}\n`);
// 判断是否有配置文件
fs.exists(configPath, function (exists) {
  if (!exists) {
    message.warning("请在根目录中新建dtstack.config.js配置文件，并以JSON格式写入配置");
    process.exit();
  } else {
    readConfigFile(configPath);
  }
});

// 读取配置
const readConfigFile = function (configPath) {
  const configArr = require(configPath);
  const tempArr = parseConfig(configArr);
  if (tempArr) {
    run(tempArr);
  } else {
    process.exit();
  }
};

/**
 * 解析并校验配置
 * @param {string} configArr
 * @returns {Object} config
 */
const parseConfig = function (configArr) {
  if (!Array.isArray(configArr)) {
    message.error("配置文件需默认导出一个数组结构");
    console.log("参考https://www.npmjs.com/package/fe-publish ");
    return false;
  }
  for (var i = 0; i < configArr.length; i++) {
    const errMsgArr = [];
    if (!configArr[i].host) {
      errMsgArr.push("host配置项为空");
    }
    if (!configArr[i].user) {
      errMsgArr.push("user配置项为空");
    }
    if (!configArr[i].targetPath) {
      errMsgArr.push("targetPath配置项为空");
    }
    if (!configArr[i].sourcePath) {
      // 默认为dist文件夹
      configArr[i].sourcePath = "./dist";
    }
    configArr[i].alias = configArr[i].alias || configArr[i].host;
    if (errMsgArr.length) {
      message.error(`${configArr.length > 1 ? `第${i + 1}组` : ""}配置有误，请检查："`);
      message.error(`message: ${errMsgArr.join(",")}`);
      return false;
    }
  }

  return configArr;
};
