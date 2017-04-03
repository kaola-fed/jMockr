const ansiEscapes = require('ansi-escapes');
const Readline = require('readline');
const readline = Readline.createInterface({
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
};

module.exports.clean = clean;
module.exports.update = function (msg) {
    clean();
    msg = '' + msg;
    readline.output.write(msg);
};
