exports.__esModule = true;
var ansiEscapes = require("ansi-escapes");
var Readline = require("readline");
var readline = Readline.createInterface({
    terminal: true,
    input: process.stdin,
    output: process.stdout
});
function clean() {
    readline.output.write(ansiEscapes.eraseLines(1));
}
exports.clean = clean;
function update(msg) {
    clean();
    msg = '' + msg;
    readline.output.write(msg);
}
exports.update = update;
//# sourceMappingURL=print.js.map