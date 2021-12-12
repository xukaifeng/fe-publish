const fs = require("fs");
const program = require("commander");
const { packageInfo } = require("./config");

module.exports = class Service {
  constructor() {
    setupDefaultCommands();

    registerCommands();
  }

  run(_id, _args = {}, rawArgv = []) {
    program.parse();
  }
};

// 设置默认命令
const setupDefaultCommands = () => {
  program.version(packageInfo.version, "-v, --version", "输出当前版本号");
  program.helpOption("-h, --help", "获取帮助");
  program.addHelpCommand(false);
};

// 注册命令
const registerCommands = () => {
  const commandsPath = `${__dirname}/commands`;

  program
    .command("add")
    .argument("<first>", "integer argument")
    .argument("[second]", "integer argument")
    .action((first, second) => {
      console.log(`${first} + ${second} = ${first + second}`);
    });

  const idToPlugin = (id) => {
    // const command = require(`${commandsPath}/${id}`);

    const commandName = id.split(".")[0];
    const alias = id.charAt(0);
    // console.log("id", id, alias);

    if (commandName === "publish") {
      program.command("publish [env]").action((env) => {
        console.log("env", env);
      });
    }
  };

  fs.readdirSync(`${commandsPath}`).forEach(idToPlugin);
};
