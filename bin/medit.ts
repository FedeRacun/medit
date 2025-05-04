#!/usr/bin/env bun
import { cac } from "cac";
import { registerInit } from "../commands/init";
import { registerLogin } from "../commands/login";
import { registerScan } from "../commands/scan";
import { registerSync } from "../commands/sync";
import { registerUser } from "../commands/user";

const cli = cac("medit");

registerInit(cli); // medit init
registerScan(cli); // medit scan
registerLogin(cli); // medit login
registerSync(cli); // medit sync
registerUser(cli); // medit user

cli.help();
cli.parse();
