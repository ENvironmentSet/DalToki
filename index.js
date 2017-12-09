var Runner = require("./lib/Runner");
var program = JSON.parse(require("fs").readFileSync("TTeok_dependencies.json","UTF-8"));
var VM = Runner();

program.dependencies.map( function loadHeaderFiles (name) {
    VM.load(name);
});

VM.load(program.main);
VM.execute();