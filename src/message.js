const chalk = require("chalk");

const info = (msg) => {
  console.log(msg);
};

const success = (msg) => {
  console.log(chalk.green(`\n✔ ${msg}`));
  console.log();
};

const error = (msg) => {
  console.log(chalk.red(`\n× ${msg}`));
  console.log();
};

const warning = (msg) => {
  console.log(chalk.yellow(`\n⚠️ ${msg}`));
};

module.exports = {
  info,
  success,
  warning,
  error,
};
