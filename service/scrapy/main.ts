import got from 'got';
import fs from 'fs';
import stream from 'node:stream';
import _ from 'lodash';

function humanFileSize(size: number) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return Number((size / (1024 ** i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

const logSize = _.throttle((transferred: number) => {
    console.log(`已下载${humanFileSize(transferred)}`);
}, 1000);

async function getNames() {
    try {
        // https://raw.githubusercontent.com/nice-registry/all-the-package-names/master/names.json
        // https://replicate.npmjs.com/_all_docs
        const str = got.stream('https://raw.githubusercontent.com/nice-registry/all-the-package-names/master/names.json');
        str.on('downloadProgress', ({transferred}) => {
            logSize(transferred);
        });
        str.on('end', () => {
            console.log('已下载完成。');
        });
        await stream.promises.pipeline(
            str,
            fs.createWriteStream('./data.json', 'utf-8'),
        );
    } catch (e: any) {
        console.error(e.message);
    }
}

getNames();
