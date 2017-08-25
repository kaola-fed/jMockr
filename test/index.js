const exec = require('child_process').exec;

let child;
function getRunKey(char) {
    return `test${char}`;
}

function runServer(char) {
    const key = getRunKey(char);
    child = exec(`npm run ${key}`, {
        cwd: __dirname,
    }, (err, stdout, stderr) => {
        // This function is useless currently, save it for debug.
        if (err) {
            // parent process kill the child_process,
            // so the code will be null and signal be "SIGTERM",
            // which will be regarded as child_process call failed.
            // console.info(err);
        } else {
            // console.info(stdout);
            // console.info(stderr);
        }
    });

    child.stdout.on('data', (data) => {
        // console.info(data);
    });
    child.stderr.on('data', (data) => {
        console.info(data);
    });

    process.on('exit', () => {
        child.kill();
        // console.info('bye');
    });

    process.on('SIGTERM', () => {
        console.log('Got SIGTERM, exiting...');
        process.exit(0);
    });

    return child;
}


module.exports = runServer;
