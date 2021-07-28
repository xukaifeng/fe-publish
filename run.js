#!/usr/bin/env node
const path = require("path");
const process = require("process");
const child_process = require("child_process");

const ora = require("ora");
const commander = require("commander");
const inquirer = require("inquirer");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

const message = require("./message");
const { errorHandle } = require("./errorHandle");

/**
 * 执行
 * @param {Array} config 配置文件内容
 */
const run = function (configArr) {
  let config = {};
  let multiEnvOptions = []; // 多环境情况，inquirer.prompt选项
  let backupPath; // 备份路径

  if (configArr.length > 1) {
    multiEnvOptions = [
      {
        type: "list",
        name: "index",
        choices: configArr.map((item, index) => ({ name: item.alias, value: index })),
        message: "\033[32m 请选择发布环境？ \033[0m",
        default: 0,
      },
    ];
  }
  const questionArr = [
    {
      type: "confirm",
      name: "isNeedBuild",
      message: "\033[32m 需要执行打包吗？ \033[0m",
      default: true,
    },
    ...multiEnvOptions,
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
  ];

  // close auto build
  if (config.closeAutoBuild) {
    questionArr.shift();
  }

  inquirer
    .prompt(questionArr)
    .then((res) => {
      config = configArr[res.index || 0];
      backupPath = config.targetPath + `_bak`;
      console.log(`${config.alias || ""}  ${config.user}@${config.host}`);

      if (res.isNeedBuild && !config.closeAutoBuild) {
        autoBuild();
      }
      return res;
    })
    .then((res) => {
      console.log("开始连接服务器...");
      console.log(`${config.user}@${config.host}\n`);
      return ssh.connect({
        host: config.host,
        username: config.user,
        password: res.password,
        port: 22, //SSH连接默认在22端口
      });
    })
    .then(
      () => {
        message.success("服务器密码验证成功");
        // 监听ctrl+C动作
        process.on("SIGINT", function () {
          rollBack(backupPath, config.targetPath)
            .then(() => {
              message.success("********** 已取消发布 **********");
              process.exit();
            })
            .catch((err) => {
              message.error("********** 取消发布失败 **********");
              process.exit();
            });
        });

        let commond = ` rm -rf ${config.targetPath}`;
        // 删除历史备份，备份待被替换的文件，删除已有targetPath
        if (!config.closeRollBack) {
          commond =
            `rm -rf ${backupPath} && cp -r ${config.targetPath} ${backupPath} && ` + commond;
        }
        return ssh.execCommand(commond);
      },
      () => {
        errorHandle(false, "Error：服务器密码错误");
      }
    )
    .then(() => {
      console.log(`已自动备份：${backupPath}\n`);
      // 发起更新
      const failedArr = [];
      const sourcePath = config.sourcePath.replace(".", process.cwd());
      console.log(`开始发布，请稍候...\n`);
      const spinner = ora("正在上传文件").start();
      ssh
        .putDirectory(sourcePath, config.targetPath, {
          recursive: true,
          tick: function (localPath, remotePath, error) {
            if (error) {
              failedArr.push(localPath);
              ora(localPath).fail();
            } else {
              spinner.text = localPath + "\n";
            }
          },
        })
        .then(function (isSuccessful) {
          if (!isSuccessful || failedArr.length) {
            spinner.fail("发布失败");
            errorHandle(failed.join(", "), "失败文件为:", () => {
              if (config.closeRollBack) return;
              rollBack(backupPath, config.targetPath);
            });
          } else {
            spinner.succeed("发布成功");
            message.success("********* Successed 🐮 **********");
            process.exit();
          }
        });
    })
    .catch((err) => {
      errorHandle(err, "发布失败", () => {
        if (config.closeRollBack) return;
        rollBack(backupPath, config.targetPath);
      });
    });
};

/**
 * 执行打包
 */
const autoBuild = () => {
  console.log();
  const spinner = ora("已开始自动打包，请稍候...").start();
  child_process.spawnSync("npm", ["run", "build"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
  spinner.succeed("打包完成！\n");
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

module.exports = run;
