const exec = require('child_process').exec;
const path = require('path');

let child;
function runServer() {
    console.info('building...');
    console.info(__dirname);

    child = exec('npm run testn', {
        cwd: __dirname
    }, (err, stdout, stderr) => {
        if (err) console.info(err);
        else {
            console.info('no error');
            console.info(stdout);
            console.info(stderr);
        }
    });

    process.on('exit', () => {
        child.kill();
        console.info('bye');
    });

    process.on('SIGTERM', () => {
        console.log('Got SIGTERM, exiting...');
        process.exit(0);
    });

    return child;
}


module.exports = runServer;
