#!/usr/bin/env bun
import { cac } from "cac";
import { registerInit } from "../commands/init";
import { registerScan } from "../commands/scan";

const cli = cac("medit");

registerInit(cli);
registerScan(cli);

cli.help();
cli.parse();
