"use strict";
exports.__esModule = true;
var ansiEscapes = require("ansi-escapes");
var Readline = require("readline");
var readline = Readline.createInterface({
    terminal: true,
    input: process.stdin,
    output: process.stdout
});
/**
 * Update the bottom bar content and rerender
 * @param  {String} bottomBar Bottom bar content
 * @return {Prompt}           self
 */
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
