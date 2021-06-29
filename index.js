#!/usr/bin/env node
const commander = require("commander");
const fs = require("fs");
const path = require("path");
const process = require("process");
const inquirer = require("inquirer");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const message = require("./message");

const configPath = path.join(process.cwd(), "dtstack.config.js");
// 判断是否有配置文件
fs.exists(configPath, function (exists) {
  if (!exists) {
    message.warning("请在根目录中新建dtstack.config.js配置文件，并写入配置");
  } else {
    readConfigFile(configPath);
  }
});

// 读取配置
const readConfigFile = function (configPath) {
  fs.readFile(configPath, "utf-8", function (err, data) {
    if (err) {
      console.log(err);
    } else {
      const config = parseConfig(data);
      if (config) {
        run(config);
      }
    }
  });
};

/**
 * 解析并校验配置
 * @param {string} configData
 * @returns {Object} config
 */
const parseConfig = function (configData) {
  try {
    const config = JSON.parse(configData);
    if (!config.host) {
      message.error("host配置有误");
      return false;
    }
    if (!config.user) {
      message.error("user配置有误");
      return false;
    }
    if (!config.targetPath) {
      message.error("targetPath配置有误");
      return false;
    }
    if (!config.sourcePath) {
      // 默认为dist文件夹
      config.sourcePath = "./dist";
    }
    return config;
  } catch (error) {
    message.warning("dtstack.config.js配置文件内容需JSON格式");
  }
  return false;
};

/**
 * 执行
 * @param {*} config
 */
const run = function (config) {
  inquirer
    .prompt([
      {
        type: "password",
        name: "password",
        message: "\033[32m 请输入服务器密码？ \033[0m",
        validate(val) {
          if (val.trim() === "") {
            return "密码不能为空!";
          }
          return true;
        },
      },
    ])
    .then((res) => {
      ssh
        .connect({
          host: config.host,
          username: config.user,
          password: res.password,
          port: 22, //SSH连接默认在22端口
        })
        .then(function () {
          //上传网站的发布包至configs中配置的远程服务器的指定地址
          console.log();
          message.success("服务器密码验证成功");
          // Putting entire directories
          const failedArr = [];
          const sourcePath = config.sourcePath.replace(".", process.cwd());
          ssh
            .putDirectory(sourcePath, config.targetPath, {
              recursive: true,
              concurrency: 10,
              // validate: function (itemPath) {
              //   const baseName = path.basename(itemPath);
              //   return (
              //     baseName.substr(0, 1) !== "." && // do not allow dot files
              //     baseName !== "node_modules"
              //   ); // do not allow node_modules
              // },
              tick: function (localPath, remotePath, error) {
                if (error) {
                  failedArr.push(localPath);
                }
              },
            })
            .then(function (isSuccessful) {
              if (failedArr.length) {
                message.warning("**********部分失败**********");
                console.log("失败文件为:", failed.join(", "));
              }
              if (isSuccessful) {
                message.success("**********部署成功**********");
              }
            });

          // ssh
          //   .putFile(__dirname + "/test.html", config.targetPath)
          //   .then(function (status) {
          //     message.success("上传文件成功");
          //   })
          //   .catch((err) => {
          //     message.error("文件传输异常");
          //     console.error("异常原因:", err);
          //     process.exit(0);
          //   });
        })
        .catch((err) => {
          console.log("ssh连接失败:", err);
          process.exit(0);
        });
    });
};
