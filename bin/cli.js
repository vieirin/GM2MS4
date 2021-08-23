#!/usr/bin/env node

const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(child_process.exec);

const yargs = require('yargs');
const ora = require('ora');
const replaceInFiles = require('replace-in-files');

const argv = yargs
    .usage('gm2ms4\n\n  $ $0 <name>')
    .epilog('Copyright @ 2019')
    .argv;

const name = argv._[0];
const package = 'https://github.com/piecioshka/gm2ms4/archive/master.zip';

if (!name) {
    yargs.showHelp();
    process.exit(1);
}

const options = {
    files: [
        `${name}/README.md`,
        `${name}/package.json`,
        `${name}/package-lock.json`,
        `${name}/bin/cli.js`,
    ],
    from: /gm2ms4/g,
    to: name
};

const state = ora();
state.start();

async function isFileExist(name) {
    try {
        await exec(`stat ${name}`);
        return true;
    } catch (ignore) {
        // console.log(ignore);
        return false;
    }
}

(async () => {
    state.info(`Create project: ${name}`);
    try {
        const isDirectoryExist = await isFileExist(name);
        if (isDirectoryExist) {
            throw new Error('Directory exist');
        }
        // Fetch github.com/piecioshka/gm2ms4
        await exec(`wget ${package} -O gm2ms4.zip`);
        await exec(`unzip gm2ms4.zip`);
        await exec(`mv gm2ms4-master ${name}`);
        await exec(`rm -rf gm2ms4.zip`);
        // Replace all "gm2ms4" by "NAME"
        await replaceInFiles(options);
        // Git setup & commit
        await exec(`cd ${name} && git init && git add . && git commit -am "Generate project"`);
        state.succeed('Project created');
        state.stop();
    } catch (reason) {
        state.fail(`Project does not created properly: ${reason.message}`);
    }
})();
