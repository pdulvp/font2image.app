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
const path = require('path')
const File = require('vinyl');
 
const { captureRejectionSymbol } = require('events');

 

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
        filteredFiles = filteredFiles.filter(x => !x.includes(".layer"));
        return Promise.resolve(filteredFiles);
    });
}

function toSprite(files, id, kind) {
    let suffix = kind == "small" ? "-preview": "";

    return Promise.resolve(true).then(value => {
        let SVGSpriter = require('svg-sprite');
        let spriter = new SVGSpriter({
            shape: {
                id: {
                    separator: '--', 
                    generator: function(e) { 
                        return id+"-"+path.basename(e, '.svg');
                    }, 
                },
                dimension: {
                    maxWidth: kind == "small" ? 24: 128,
                    maxHeight: kind == "small" ? 24: 128,
                },
                spacing: {
                    padding: 2
                }
            },
            dest: '../webfonts',
            mode: {
                css: {
                    inline: true,
                    bust: false,
                    sprite:  ""+id+suffix+".svg",
                    render: {
                        css: {
                            dest: ""+id+suffix+".css"
                        }
                    }
                }
            }
        });
        let cwd = path.resolve('.');
        files = files.filter(x => !x.includes(".layer"));
        files.forEach(file => {
            
            const id = path.basename(file, '.svg');
            spriter.add(new File({
                path: path.join(cwd, file),                    
                base: cwd,                                       
                contents: fs.readFileSync(path.join(cwd, file))  
            }));
        });
        return Promise.resolve(spriter);

    }).then(spriter => {
        return new Promise(function(resolve, reject) {
            spriter.compile(function (error, result, data) {
                if (error) {
                    reject(error);
                } else {
                    console.log("result");
                    console.log(result);
                    console.log("data");
                    console.log(data);
                    resolve(result);
                }
            });
        });

    }).then(output => {
        return Promise.resolve(output);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function addUses(sprites, limit = -1) {
    // Find id of symbols
    let map = /<symbol id=\"([^\"]+)\"[^<"]+viewBox=\"([^\"]+)\"/g;
    let array = [...sprites.matchAll(map)].map(x => { return { id: x[1], box: x[2] } } );
    //array = array.filter(x => x.box == array[0].box);
    if (limit > -1) {
        shuffleArray(array);
        array = array.slice(0, limit);
    }

    array.forEach(i => {
        i.w = 24;//parseInt(i.box.split(" ")[2]); 
        i.h = 24;//parseInt(i.box.split(" ")[2])
    });
    array.reduce((value, i) => {
        let maxWidth = (i.w * 8);
        i.y = Math.floor((value / maxWidth)) * i.h; i.x = value % maxWidth; return value + i.w; }
    , 0);

    let start = sprites.substring(0, sprites.indexOf("<symbol"));
    let symbols = array.map(i => {
        let rr = new RegExp(`<symbol id="${i.id}.+?</symbol>`, "g");
        return [...sprites.matchAll(rr)].map(xx => xx[0])[0];
    }).join("\n");

    let uses = array.map(item => `<use xlink:href="#${item.id}" x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" fill="rgb(0, 0, 0)"></use>`).join("\n");
    let result = start + symbols + uses + "</svg>";
    return result;
}

function exportSprites(folders, filename, exportSvg = true) {
    console.log(filename);
    let fetchs = folders.map(x => getAll(x, "svg"));
    let fontName = folders[0].split("/")[0];
    return Promise.all(fetchs)
        .then(filesPerFolder => Promise.resolve(promiseq.flat(filesPerFolder)))
        .then(files => {
            
            return new Promise(function(resolve, reject) {
                toSprite(files, fontName, "").then(full => {
                    shuffleArray(files);
                    files = files.slice(0, 16);
                    console.log(files);
                    toSprite(files, fontName, "small").then(small => {
                        resolve({full: full, small: small});
                    });
                });
            });

        }).then(sprites => {
            let contents = sprites.full.css.sprite.contents.toString().replace(/fill=\"#444\"/g, ""); //vaading
            contents = contents.replace(/fill=\"currentColor\"/g, ""); //bootstrap
            fs.writeFileSync(sprites.full.css.sprite.path, contents);
            return Promise.resolve(sprites);

        }).then(sprites => {
            let contents = sprites.small.css.sprite.contents.toString().replace(/fill=\"#444\"/g, "");
            contents = contents.replace(/fill=\"currentColor\"/g, ""); //bootstrap
            fs.writeFileSync(sprites.small.css.sprite.path, contents);
            return Promise.resolve(sprites);

            /*let sprites2 = sprites.replace(/<svg /g, "<svg xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\" ");
            sprites2 = sprites2.replace(new RegExp(`<metadata.+?</metadata>`, "g"), function(match, group) {
                console.log(match);
                return "";
              });
            sprites2 = sprites2.replace(new RegExp(`<style.+?</style>`, "g"), function(match, group) {
                console.log(match);
                return "";
              });
              if (exportSvg) {
                let result = addUses(sprites2);
                return fsq.writeIfChange(filename, result).then(res => {
                    return Promise.resolve(sprites2);
                });
              } else {
                return Promise.resolve(sprites2);
              }
*/
        })/*.then(sprites => {
            let content = sprites.full.css.css.contents.toString();
            content = content.replace(/url\(\"/g, "url\(\"/webfonts/css/");
            fs.writeFileSync(sprites.full.css.css.path, content);
            return Promise.resolve(sprites);

        })*/.then(sprites => {
            return Promise.resolve(sprites);
            /*let output = sprites;
            output = addUses(output, 16);
            return fsq.writeIfChange(filename+".preview.svg", output);
*/
        });
}

Promise.resolve(true).then(e => {
    return exportSprites(["ionicons/src/svg"], "../webfonts/ionicons.svg");
}).then(e => {
    return exportSprites(["boxicons/svg/logos", "boxicons/svg/regular", "boxicons/svg/solid"], "../webfonts/boxicons.svg");
}).then(e => {
    return exportSprites(["material-design-iconic-font/svg"], "../webfonts/material-design-iconic-font.svg");
}).then(e => {
    return exportSprites(["microns/svg"], "../webfonts/microns.svg");
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
}).then(e => {
    return exportSprites(["remixicon/icons"], "../webfonts/remixicon.svg");
}).then(e => {
    return exportSprites(["font-awesome/svgs"], "../webfonts/font-awesome.svg");
}).then(e => {
    return exportSprites(["evil-icons/assets/icons"], "../webfonts/evil-icons.svg");
}).then(e => {
    return exportSprites(["fxemoji/svgs"], "../webfonts/fxemoji.svg");
}).then(e => {
    return exportSprites(["noto-emoji/svg"], "../webfonts/noto-emoji.svg");
}).catch(e => {
    console.log(e);
});