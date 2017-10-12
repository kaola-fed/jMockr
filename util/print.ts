import * as ansiEscapes from 'ansi-escapes'
  import * as Readline from 'readline'
const readline: any = Readline.createInterface({
    terminal: true,
    input: process.stdin,
    output: process.stdout,
})

/**
 * Update the bottom bar content and rerender
 * @param  {String} bottomBar Bottom bar content
 * @return {Prompt}           self
 */
function clean(): void {
    readline.output.write(ansiEscapes.eraseLines(1))
}

function update(msg: string): void {
    clean()
    msg = '' + msg
    readline.output.write(msg)
}

export {
    clean,
    update,
}
