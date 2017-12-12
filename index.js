"use strict";
var path = require("path");
var fs = require("fs");
var interpreter_path = process.argv[1]; // 주소 다루는 모듈 하나 만들어야할듯.
var program_dir_path = process.argv[2];
var Runner = require(path.join(interpreter_path,"lib","Runner.js"));
var program = JSON.parse(fs.readFileSync(path.join(program_dir_path,"TTeok_dependencies.json")));
var VM = Runner();

VM.load(path.join(__dirname,"standard_modules","standard_builtIN.js"));
program.dependencies.map( function loadHeaderFiles (name) {
    VM.load(path.join(program_dir_path,name));
});

VM.load(path.join(program_dir_path,program.main));
VM.execute();