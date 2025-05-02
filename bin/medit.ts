#!/usr/bin/env bun
import { cac } from "cac";
import { registerInit } from "../commands/init";
import { registerScan } from "../commands/scan";
import { registerLogin } from "../commands/login";

//! TEST
import { downloadFileFromDrive } from "../auth/drive";
import { registerSync } from "../commands/sync";

const cli = cac("medit");

// ! TEST
cli.command("test", "testea").action(async () => {
  await downloadFileFromDrive(
    "1g72UCFzhLkN_6i1pioQ9KCGI2wD4QqW-",
    "./media/gato4.jpg"
  );
});

registerInit(cli); // medit init
registerScan(cli); // medit scan
registerLogin(cli); // medit login
registerSync(cli); // medit sync


cli.help();
cli.parse();
