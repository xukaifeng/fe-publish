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
    message.warning("请在根目录中新建dtstack.config.js配置文件，并以JSON格式写入配置");
    process.exit();
  } else {
    readConfigFile(configPath);
  }
});

// 读取配置
const readConfigFile = function (configPath) {
  fs.readFile(configPath, "utf-8", function (err, data) {
    if (err) {
      message.error("读取配置文件失败m");
      process.exit();
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
  console.log(`${config.user}@${config.host}\n`);

  // 文件备份路径
  const backupPath = config.targetPath + `_bak`;

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
          message.success("服务器密码验证成功");

          // 删除历史备份，备份待被替换的文件
          ssh
            .execCommand(`rm -rf ${backupPath} && cp -r ${config.targetPath} ${backupPath}`)
            .then(function () {
              console.log(`已自动备份：${backupPath}\n`);
              return;
            })
            .then(() => {
              // 发起更新
              const failedArr = [];
              const sourcePath = config.sourcePath.replace(".", process.cwd());
              console.log(`开始替换文件...\n`);
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
                  if (!isSuccessful || failedArr.length) {
                    console.log("失败文件为:", failed.join(", "));
                    // 还原
                    rollBack(backupPath, config.targetPath);
                  } else {
                    console.log("文件替换完成");
                    message.success("********* Successed 🐮 **********");
                    process.exit();
                  }
                })
                .catch((err) => {
                  message.error("ERROR：");
                  console.error(err);
                  // 还原
                  rollBack(backupPath, config.targetPath);
                });
            });
        })
        .catch((err) => {
          message.error("发生错误");
          console.log(err);
          // 还原
          rollBack(backupPath, config.targetPath);
        });
    });
};

/**
 * 文件回滚
 */
const rollBack = function (backupPath, targetPath) {
  return ssh
    .execCommand(`rm -rf ${targetPath} && cp -r ${backupPath} ${targetPath}`)
    .then(function () {
      message.warning("映射文件已自动还原");
      message.error("********** Failed 💣 **********");
      process.exit();
    });
};
