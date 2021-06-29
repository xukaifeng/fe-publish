const chalk = require("chalk");

const success = (msg) => {
  console.log(chalk.green(`✔ ${msg}`));
  console.log();
};

const error = (msg) => {
  console.log(chalk.red(`× ${msg}`));
  console.log();
};

const warning = (msg) => {
  console.log(chalk.yellow(`⚠️ ${msg}`));
  console.log();
};

module.exports = {
  success,
  warning,
  error,
};
