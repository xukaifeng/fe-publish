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

const configPath = path.join(process.cwd(), ".ferc");

// 判断是否有配置文件
fs.exists(configPath, function (exists) {
  if (!exists) {
    message.warning("请在根目录中新建.ferc配置文件，并以JSON格式写入配置");
    process.exit();
  } else {
    readConfigFile(configPath);
  }
});

// 读取配置
const readConfigFile = function (configPath) {
  fs.readFile(configPath, "utf-8", function (err, content) {
    if (err) {
      message.error("读取配置文件失败");
      process.exit();
    } else {
      const tempArr = parseConfig(content);
      if (tempArr) {
        tempArr.forEach((item, index) => {
          console.log(`【${item.name}】${item.host}${tempArr.length - 1 === index ? "\n" : ""}`);
        });
        run(tempArr);
      } else {
        process.exit();
      }
    }
  });
};

/**
 * 解析并校验配置
 * @param {string} configString
 * @returns {Object} config
 */
const parseConfig = function (configString) {
  let configArr;
  try {
    configArr = JSON.parse(configString);
    if (!Array.isArray(configArr)) {
      message.error("配置文件内容应满足JSON格式");
      console.log("参考https://www.npmjs.com/package/fe-publishtool ");
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
      configArr[i].name = configArr[i].name || configArr[i].host;
      if (errMsgArr.length) {
        message.error(`${configArr.length > 1 ? `第${i + 1}组` : ""}配置有误，请检查："`);
        message.error(`message: ${errMsgArr.join(",")}`);
        return false;
      }
    }
  } catch (error) {
    console.log(".ferc配置文件，配置格式有误");
    return false;
  }

  return configArr;
};
