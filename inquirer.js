#!/usr/bin/env node

const commander = require("commander");
const fs = require("fs");
const path = require("path");
const process = require("process");
const inquirer = require("inquirer");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

const configPath = path.join(process.cwd(), "dtstack.config.js");
fs.readFile(configPath, "utf-8", function (err, data) {
  if (err) {
    console.log(err);
  } else {
    // const config = JSON.parse(data);
    console.log(data.host);
  }
});

inquirer
  .prompt([
    {
      type: "password",
      name: "",
      message: "\033[32m 请输入服务器密码？ \033[0m",
      validate(val) {
        if (val.trim() === "") {
          return "密码不能为空!";
        }
        return true;
      },
      filter(val) {
        return val.toLowerCase();
      },
    },
  ])
  .then((res) => {
    console.log(res);
    ssh
      .connect({
        //configs存放的是连接远程机器的信息
        host: configs.host,
        username: configs.user,
        password: res.password,
        port: 22, //SSH连接默认在22端口
      })
      .then(function () {
        //上传网站的发布包至configs中配置的远程服务器的指定地址
        ssh
          .putFile(__dirname + "/public.zip", configs.path)
          .then(function (status) {
            console.log("上传文件成功");
          })
          .catch((err) => {
            console.log("文件传输异常:", err);
            process.exit(0);
          });
      })
      .catch((err) => {
        console.log("ssh连接失败:", err);
        process.exit(0);
      });
  });
