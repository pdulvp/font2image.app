/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/
const fs = require('fs')
const fsq = require('./fsq')
const url = require('url');
const httpq = require('./httpq')
const cacheq = require('./cacheq')
const promiseq = require('./promiseq')
const svgstore = require('svgstore')
const htmlclean = require('htmlclean')
const path = require('path')


function getFiles(folder) {
    return new Promise(function(resolve, reject) {
        fs.readdir(folder, (err, subdirs) => {
            Promise.all(subdirs.map(subdir => {
                const res = path.join(folder, subdir);
                return (fs.statSync(res)).isDirectory() ? getFiles(res) : res;

            })).then(files => {
                resolve(files.reduce((a, f) => a.concat(f), []));
            })
        });
    });
}

function getAll(folder, extension) {
    return getFiles(folder).then(files => {
        let filteredFiles = files.filter(x => x.endsWith("."+extension));
        return Promise.resolve(filteredFiles);
    });
}

function toSprite(folders) {
    let sprites = svgstore();
    let fetchs = folders.map(x => getAll(x, "svg"));
    return Promise.all(fetchs)
    .then(filesPerFolder => Promise.resolve(promiseq.flat(filesPerFolder)))
    .then(files => {
        files.forEach(file => {
            const id = path.basename(file, '.svg');
            const contents = fs.readFileSync(file, 'utf8');
            sprites.add(id, contents);
        });
        return Promise.resolve(sprites);
    }).then(sprites => {
        let output = htmlclean(sprites.toString());
        return Promise.resolve(output);
    }).then(output => {
        output = output.replace(/ fill=\"#444\" /g, " ");
        return Promise.resolve(output);
    });
}

function exportSprites(folders, filename) {
    return toSprite(folders).then(sprites => {
        return fsq.writeIfChange(filename, sprites);
    });
}

Promise.resolve(true).then(e => {
    return exportSprites(["boxicons/svg/logos", "boxicons/svg/regular", "boxicons/svg/solid"], "../webfonts/boxicons.svg");
}).then(e => {
    return exportSprites(["microns/svg"], "../webfonts/microns.svg");
}).then(e => {
    return exportSprites(["material-design-iconic-font/svg"], "../webfonts/material-design-iconic-font.svg");
}).then(e => {
    return exportSprites(["ionicons/src/svg"], "../webfonts/ionicons.svg");
}).then(e => {
    return exportSprites(["devicon/icons"], "../webfonts/devicon.svg");
}).then(e => {
    return exportSprites(["weather-icons/svg"], "../webfonts/weather-icons.svg");
}).then(e => {
    return exportSprites(["line-awesome/svg"], "../webfonts/line-awesome.svg");
}).then(e => {
    return exportSprites(["twbs-icons/icons"], "../webfonts/twbs-icons.svg");
}).then(e => {
    return exportSprites(["vaadin-icons/assets/svg"], "../webfonts/vaadin-icons.svg");
}).then(e => {
    return exportSprites(["phosphor-icons/assets"], "../webfonts/phosphor-icons.svg");
});
