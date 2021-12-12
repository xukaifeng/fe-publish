const fs = require("fs");
const os = require("os");
const path = require("path");

const beautyTextFn = (text) => {
  return "\033[32m " + text + " \033[0m";
};

const envConfig = [
  {
    type: "input",
    name: "devName",
    message: "环境名称",
    default: "开发环境",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "input",
    name: "devScript",
    message: "打包命令",
    default: "npm run build:dev",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "input",
    name: "devHost",
    message: "服务器地址",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "number",
    name: "devPort",
    message: "服务器端口号",
    default: 22,
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "input",
    name: "devUsername",
    message: "用户名",
    default: "root",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "password",
    name: "devPassword",
    message: "密码",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "input",
    name: "devDistPath",
    message: "本地打包目录",
    default: "dist",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "input",
    name: "devWebDir",
    message: "部署路径",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "input",
    name: "devBakDir",
    message: "备份路径",
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "confirm",
    name: "devIsRemoveRemoteFile",
    message: "是否删除远程文件",
    default: true,
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
  {
    type: "confirm",
    name: "devIsRemoveLocalFile",
    message: "是否删除本地打包文件",
    default: true,
    when: (answers) => answers.deployEnvList.includes("dev"),
  },
];

module.exports = {
  packageInfo: require("../../package.json"),
  deployConfigPath: `${path.join(process.cwd())}/deploy.config.js`,
  inquirerConfig: [
    {
      type: "input",
      name: "projectName",
      message: "请输入项目名称",
      default: fs.existsSync(`${path.join(process.cwd())}/package.json`)
        ? require(`${process.cwd()}/package.json`).name
        : "",
    },
    {
      type: "checkbox",
      name: "deployEnvList",
      message: "请选择需要部署的环境",
      choices: [
        {
          name: "dev",
          checked: true,
        },
        {
          name: "test",
        },
        {
          name: "prod",
        },
      ],
    },
    ...envConfig,
  ],
};
