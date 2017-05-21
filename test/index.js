const exec = require('child_process').exec;
const path = require('path');

let child;
function startTest() {
    console.info('building...');
    console.info(__dirname);

    child = exec('npm run test', {
        cwd: __dirname
    }, (err, stdout, stderr) => {
        if (err) console.info(err);
    });

    process.on('exit', () => {
        child.kill();
        console.info('bye');
    });

    process.on('SIGTERM', () => {
        console.log('Got SIGTERM, exiting...');
        process.exit(0);
    });

}


startTest();
