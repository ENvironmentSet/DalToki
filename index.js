"use strict";
var path = require("path");
var fs = require("fs");
var interpreter_path = process.argv[1]; // 주소 다루는 모듈 하나 만들어야할듯.
var program_dir_path = process.argv[2];
var Runner = require(path.join(interpreter_path,"lib","Runner.js"));
var program = JSON.parse(fs.readFileSync(path.join(program_dir_path,"TTeok_dependencies.json")));
var VM = Runner();

VM.load(path.join(__dirname,"standard_modules","standard_builtIN.js"));
for(var type in program.dependencies) {
    switch(type) {
        case "core":
            program.dependencies.core.map( function loadCoreModule (name) {
                VM.load(path.join(interpreter_path,"standard_modules",name));
            });
            break;
        default:
            program.dependencies[type].map( function loadCoreModule (name) {
                VM.load(path.join(interpreter_path,type,name));
            });
            break;
    }
}

VM.load(path.join(program_dir_path,program.main));
VM.execute();