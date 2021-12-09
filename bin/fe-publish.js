#!/usr/bin/env node
const Service = require("../lib/service");
try {
  const service = new Service();

  const rawArgv = process.argv.slice(2);
  const args = require("minimist")(rawArgv);
  const command = args._[0];
  console.log("hello1", args);
  service.run(command, args, rawArgv);
} catch (error) {
  console.log(error);
}
