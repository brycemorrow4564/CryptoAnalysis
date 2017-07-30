'use_strict';

const http = require('http');
const fs = require('fs');
const fse = require('fs-extra');
const url = require('url');
const path = require('path');
const mkdirp = require('mkdirp');
const readdirp = require('readdirp');
const request = require('request');
const progress = require('request-progress');
const AdmZip = require('adm-zip');
const pretty = require('prettysize');
const packageJson = require('./package.json');

let oUrl = url.parse(`http://openui5.hana.ondemand.com/downloads/openui5-runtime-${packageJson.version}.zip`);

let downloadDir = path.resolve(__dirname + path.dirname(oUrl.pathname));
let outDir = path.resolve(`${__dirname}/lib/${packageJson.version}`);
if (!fs.existsSync(downloadDir)) {
    mkdirp.sync(downloadDir);
}

if (!fs.existsSync(outDir)) {
    mkdirp.sync(outDir);
} else {
    if (fs.existsSync(path.resolve(`${outDir}/resources/sap-ui-core.js`))) {
        console.log('Already exists. Skipping download and extraction.');
        return;
    }
}
let oFile = path.resolve(__dirname + oUrl.pathname);

new Promise((resolve, reject) => {
    console.log(`Downloading ${oUrl.href} into ${outDir}`);
    progress(request(oUrl.href))
        .on('progress', state => {
            let percent = Math.round(state.percent*100, 10);
            console.log(`Downloaded: ${Math.round(state.percent*100, 10)}% [${pretty(state.size.transferred)} / ${pretty(state.size.total)}]`)
        })
        .on('error', err => {
            reject(err);
        })
        .on('end', () => {
            resolve();
        })
        .pipe(fs.createWriteStream(oFile));
}).then(() => {
    console.log(`Starting extraction of '${oFile}' into '${outDir}'...`);
    return new Promise((resolve, reject) => {
        var zip = new AdmZip(oFile);
        zip.extractAllTo(outDir, true);
        resolve();
    });
}).then(() => {
    console.log('Cleanup: removing dbg files');
    let i = 0;
    let delSize = 0;
    return new Promise((resolve, reject) => {
        readdirp({ root: outDir, fileFilter: '*-dbg.js' })
            .on('data', function (entry) {
                console.log(`Removing ${entry.fullPath}`);
                fse.removeSync(entry.fullPath);
                i++;
                delSize += entry.stat.size;
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                console.log(`Cleanup: ${i} files removed. Saved ${pretty(delSize)}.`);
                resolve();
            })
    });
}).then(() => {
    console.log('Cleanup: removing downloads');
    return new Promise((resolve, reject) => {
        fse.removeSync(downloadDir);
        resolve();
    });
}).catch(function(err) {
    console.log(err);
});