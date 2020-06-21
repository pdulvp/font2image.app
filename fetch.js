/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/

var index = require("@pdulvp/font2css");
var fsquery = require('@pdulvp/fsquery'); 
var url = require('url'); 
var httpq = require("@pdulvp/httpquery");


fsquery.read("fonts.json").then(e => {
	JSON.parse(e).filter(e => e.font2css === true).forEach(f => {
		console.log(f.fontUrl);
		let uri = url.parse(f.fontUrl, true);
		if (uri.protocol != undefined) {
			httpq.saveTo(uri, `tmp/${f.name}.ttf`).then(e => {
				let prefix = f.name.toLowerCase();
				return index.toCss(e, `.${prefix}-`);
			}).then(e => {
				fsquery.write(`webfonts/${f.name}.css`, e);
			}).catch(e => {
				console.log(e);
			});
		} else {
			let packagePath = require("path").dirname(require.resolve("./package.json"));
			let fontFile = packagePath+"/"+f.fontUrl;
			let prefix = f.name.toLowerCase();
			index.toCss(fontFile, `.${prefix}-`).then(e => {
				fsquery.write(`webfonts/${f.name}.css`, e);
			}).catch(e => {
				console.log(e);
			});
		}
	});
});


