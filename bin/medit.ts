#!/usr/bin/env bun
import { cac } from "cac";
import { registerInit } from "../commands/init";
import { registerScan } from "../commands/scan";
import { registerLogin } from "../commands/login";

const cli = cac("medit");

registerInit(cli);
registerScan(cli);
registerLogin(cli);

cli.help();
cli.parse();
