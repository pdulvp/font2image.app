/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/

var fonts = undefined;

function random(min, max, count) {
	count = Math.min(count, max - min);
	let result = [];
	while (count > 0) {
		let int = Math.floor(Math.random()*(max - min + 1))+min;
		while (result.indexOf(int)>=0) {
			int = Math.floor(Math.random()*(max - min + 1))+min;
		}
		result.push(int);
		count --;
	}
	return result;
}

function hasClass(item, value) {
	return item.getAttribute("class") != null && (item.getAttribute("class").includes(value));
}

function removeClass(item, value) {
	if (hasClass(item, value)) {
		item.setAttribute("class", item.getAttribute("class").replace(value, "").trim());
	}
}
const unique = (value, index, self) => {
	return self.indexOf(value) === index;
}

function addClass(item, value) {
    if (!hasClass(item, value)) {
        let current = item.getAttribute("class");
        current = current == null ? "" : current;
        item.setAttribute("class", (current+ " "+value+" ").trim());
    }
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function flatSVG(svg) {

	var wrap = document.createElement('div');
	wrap.appendChild(svg.cloneNode(true));
	let svgCopy = wrap.children[0];
	let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
	svgCopy.appendChild(defs);
	defs.appendChild(document.getElementById("filterMatrix").cloneNode(true));
	let used = svgCopy.children[0].getAttribute("href").substring(1);
	defs.appendChild(document.getElementById(used).cloneNode(true));
	return svgCopy;
}

function drawSVG(svg, translucentBackground) {
	console.log("drawSVG");
	return new Promise((resolve, reject) => {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");

		if (!translucentBackground) {
			ctx.beginPath();
			ctx.filter = "none";
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.closePath();
		}

		ctx.imageSmoothingEnabled = false;
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		canvas.width = svg.getAttribute("width");
		canvas.height = svg.getAttribute("height");
		let img = document.createElement("img");
		var xml = new XMLSerializer().serializeToString(svg);
		img.width = svg.getAttribute("width");
		img.height = svg.getAttribute("height");
		let fct = function() {
			ctx.drawImage(img, 0, 0);
			console.log("drawImage");
			resolve(canvas);
		};
		img.addEventListener ("load", fct, true);
		img.src = 'data:image/svg+xml;base64,'+btoa(xml);
	});
}

function download() {
	var zip = new JSZip();
	var img = zip.folder("images");
	
	let value = document.getElementById("download-type").value;
	let types = { "gif": "image/gif", "jpg": "image/jpeg", "png": "image/png", "svg": "image/svg+xml" };
	let type = types[value] == undefined ? "image/png": types[value];
	let ext = types[value] == undefined ? "png": value;

	let activeCases = Array.from(document.getElementsByClassName("active"));
	Promise.resolve(true).then(n => {
		let promises = activeCases.map(svg => {
			let svgCopy = flatSVG(svg);
			if (value == "svg") {
				return new Promise((resolve, reject) => {
					let res = b64EncodeUnicode(new XMLSerializer().serializeToString(svgCopy));
					img.file(svg.getAttribute("title") + "." + ext, (res), { base64: true });
					resolve(true);
				});

			} else {
				return drawSVG(svgCopy, translucentBackground).then(canvas => {
					return new Promise((resolve, reject) => {
						let url2 = canvas.toDataURL(type);
						img.file(svg.getAttribute("title") + "." + ext, url2.split(",")[1], { base64: true });
						resolve(true);
					});
				});
			}
		});
		return Promise.all(promises);

	}).then(e => {
		return zip.generateAsync( {type: "blob"} );

	}).then(function(content) {
		saveAs(content, "images.zip");
	});
}

function totototo(event) {
	if (hasClass(event.target, "active")) {
		removeClass(event.target, "active");
	} else {
		addClass(event.target, "active");
	}
	console.log(Array.from(document.getElementsByClassName("active")).map(x => x.id));
}

let fontSize = 40;
let padding = 4;
let hue = Math.random();
let saturation = 0.3 + Math.random() / 2.2;
let luminance = 0.5 + Math.random() / 10;
let alpha = 1;

updateSize();
updateSaturation();

let cacheCss = {};
let cacheJson = {};

var easter = false;

let ticking = false;
let timeout = null;
function triggerUpdate(delay) {
	if (timeout != null) {
		window.clearTimeout(timeout);
		timeout = null;
	}
	timeout = window.setTimeout(() => {
		updateImages(false);
	}, delay == undefined ? 100 : delay);
}

let translucentBackground = document.getElementById("download-type").value == "png" || document.getElementById("download-type").value == "svg";
document.getElementById("download-type").onchange=function(event) {
	translucentBackground = event.target.value == "png" || event.target.value == "svg";
	triggerUpdate();
};

document.getElementById("imageSize").value = fontSize;
document.getElementById("imageSize").oninput=function(event) {
	fontSize = parseInt(event.target.value);
	updateSize();
	//triggerUpdate();
};
document.getElementById("imageSize").onchange=function(event) {
	triggerUpdate(0);
};
document.getElementById("padding").value = padding;
document.getElementById("padding").oninput=function(event) {
	padding = parseInt(event.target.value);
	updateSize();
	//triggerUpdate();
};
document.getElementById("padding").onchange=function(event) {
	triggerUpdate(0);
};
document.getElementById("hue").value = hue * 100;
document.getElementById("hue").oninput=function(event) {
	hue = parseInt(event.target.value) / 100;
	updateSaturation();
	updateSize();
	triggerUpdate();
};
document.getElementById("hue").onchange=function(event) {
	triggerUpdate(0);
};
document.getElementById("saturation").value = saturation * 100;
document.getElementById("saturation").oninput=function(event) {
	let hhu = Math.round(hue*355);
	saturation = parseInt(event.target.value) / 100;
	updateSize();
	updateSaturation();
	triggerUpdate();
};
document.getElementById("saturation").onchange=function(event) {
	triggerUpdate(0);
};
document.getElementById("luminance").value = luminance * 100;
document.getElementById("luminance").oninput=function(event) {
	luminance = parseInt(event.target.value) / 100;
	updateSize();
	triggerUpdate();
};
document.getElementById("luminance").onchange=function(event) {
	triggerUpdate(0);
};
document.getElementById("alpha").value = Math.floor(alpha * 100);
document.getElementById("alpha").oninput=function(event) {
	alpha = parseInt(event.target.value) / 100;
	updateSize();
	triggerUpdate();
};
document.getElementById("alpha").onchange=function(event) {
	triggerUpdate(0);
};
document.getElementById("download").onclick=function(event) {
	download();
};
document.getElementById("canvases-preview").ondblclick = function(event) {
	easter = !easter;
	updateSize();
}


function getFonts() {
	if (fonts != undefined) {
		return new Promise((resolve, reject) => {
			resolve(fonts);
		});
	} else {
		let httpquery = require("@pdulvp/httpquery");
		return httpquery.get("fonts.json").then(e => {
			fonts = JSON.parse(e);
			fonts.forEach(f => f.family = f.name.replace(/ /g, ""));
			fonts.forEach(f => f.visible = false);
			random(0, fonts.length - 1, 2).forEach(x => fonts[x].visible = true);
			console.log(fonts);
			Promise.resolve();
		});
	}
}

function updateFonts() {
	getFonts().then(e => {
		
		let fontsUi = document.getElementById("font-chooser");
		fontsUi.innerHTML = "";
		fonts.filter(f => f.visible).forEach(f => fontsUi.appendChild(addFont(f, "font-chooser-item-close", "Remove",
			function(e) {
				fonts.filter(f => f.name == e.target.parentNode.getAttribute("font-name")).forEach(f => f.visible = false);
				updateFonts();
			})));
		if (fonts.filter(f => f.visible == false).length > 0) {
			fontsUi.appendChild(addFontAdd());
		}
		updateImages(false);
	});
}

function updateChoosableFonts() {
	let fontsUi = document.getElementById("modal-font");
	fontsUi.innerHTML = "";
	fonts.filter(f => !f.visible).forEach(f => fontsUi.appendChild(addFont(f, "font-chooser-item-add", "Add",
		function(e) {
			fonts.filter(f => f.name == e.target.parentNode.getAttribute("font-name")).forEach(f => f.visible = true);
			e.target.parentNode.parentNode.removeChild(e.target.parentNode);
			updateFonts();
		})));
}

function addFontAdd() {
	let root = document.createElement("div");
	addClass(root, "font-chooser-item");
	addClass(root, "font-chooser-item-button");
	let text = document.createElement("div");
	root.appendChild(text);
	let button = document.createElement("div");
	addClass(button, "font-chooser-item-add");
	button.setAttribute("aria-label", "Add");
	button.onclick = (function(e) {
		removeClass(document.getElementById("modal-back"), "modal-hide");
		updateChoosableFonts();
		
		document.getElementById("modal-font").style.top = e.target.offsetTop + e.target.offsetHeight;
		document.getElementById("modal-font").style.left = document.getElementById("font-chooser").offsetLeft;
		removeClass(document.getElementById("modal-font"), "modal-hide");
	});
	root.appendChild(button);
	return root;
}



function hideModal() {
	addClass(document.getElementById("modal-back"), "modal-hide");
	addClass(document.getElementById("modal-font"), "modal-hide");
	addClass(document.getElementById("modal-about"), "modal-hide");
	addClass(document.getElementById("modal-license"), "modal-hide");
	addClass(document.getElementById("modal-sponsor"), "modal-hide");
}

document.getElementById("modal-back").onclick = function(e) {
	hideModal();
	clearAnimation();
}
document.getElementById("modal-about").onclick = function(e) {
	hideModal();
	clearAnimation();
}
document.getElementById("modal-license").onclick = function(e) {
	hideModal();
	clearAnimation();
}
document.getElementById("modal-sponsor").onclick = function(e) {
	hideModal();
	clearAnimation();
}

function addFont(font, classButton, ariaLabel, onclick) {
	let root = document.createElement("div");
	addClass(root, "font-chooser-item");
	let text = document.createElement("div");
	text.textContent = font.name;
	root.setAttribute("font-name", font.name);
	root.appendChild(text);
	if (ariaLabel == "Add") {
		let p = document.createElement("p");
		let img = document.createElement("img");
		text.appendChild(p);
		p.appendChild(img);
		let image = font.preview == undefined ? `/webfonts/${font.name}.svg.preview.svg` : font.preview;
		img.src = image;
		img.width = 120;
		img.height = 120;
	}
	let button = document.createElement("div");
	button.setAttribute("aria-label", ariaLabel);
	addClass(button, classButton);
	button.onclick = onclick;
	root.appendChild(button);
	
	return root;
}

updateFonts();

function showModal(e) {
	let modalId = e.target.getAttribute("modal");
	let view = document.getElementById(modalId);
	drawImage(e.target.getAttribute("modal-icon"));

	removeClass(document.getElementById("modal-back"), "modal-hide");
	removeClass(view, "modal-hide");
}

document.getElementById("link-about").onclick = showModal;
document.getElementById("link-sponsor").onclick = showModal;
document.getElementById("link-license").onclick = showModal;

function updateSize() {
	let canvas = document.getElementById("canvases-preview");
	canvas.width = window.getComputedStyle(canvas).width.replace("px", "");
	canvas.height = window.getComputedStyle(canvas).width.replace("px", "");

	let color = getHslColor();

	let hsl = [ hue * 360, saturation * 100, luminance  * 100 ];
	let fontColor = `hsl(${hsl[0]}, 40%, 40%)`;
	let strokeColor = `hsl(${hsl[0]}, 40%, 5%)`;

	var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
		ctx.fillStyle = color;
		ctx.strokeStyle = strokeColor;

		ctx.beginPath();
		let paddingRatio = (fontSize > canvas.width - 2) ? (padding * (canvas.width - 2) / fontSize) : 1;
		let w = Math.min(Math.max(0, fontSize - padding * 2), canvas.width - paddingRatio * 2);
		let h = Math.min(Math.max(0, fontSize - padding * 2), canvas.height - paddingRatio * 2) ;
		let x = Math.max(0, Math.floor((canvas.width - paddingRatio * 2) / 2 - w / 2)) + paddingRatio;
		let y = Math.max(0, Math.floor((canvas.height - paddingRatio * 2) / 2 - h / 2)) + paddingRatio;
		ctx.fillRect(x, y, w, h);
		ctx.closePath();

		ctx.beginPath();
		w = Math.min(Math.max(0, fontSize + 2), canvas.width);
		h = Math.min(Math.max(0, fontSize + 2), canvas.height);
		x = Math.max(0, Math.floor(canvas.width / 2 - w / 2));
		y = Math.max(0, Math.floor(canvas.height / 2 - h / 2));
		ctx.rect(x, y, w, h);
		ctx.setLineDash([1, 1]);
		ctx.stroke();
		ctx.closePath();

		let sizeCrochet = 6;
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.moveTo(x, y);
		ctx.lineTo(x-sizeCrochet, y);
		ctx.moveTo(x, y);
		ctx.lineTo(x, y-sizeCrochet);

		ctx.moveTo(x+w, y);
		ctx.lineTo(x+w+sizeCrochet, y);
		ctx.moveTo(x+w, y);
		ctx.lineTo(x+w, y-sizeCrochet);

		ctx.moveTo(x, y+h);
		ctx.lineTo(x-sizeCrochet, y+h);
		ctx.moveTo(x, y+h);
		ctx.lineTo(x, y+sizeCrochet+h);

		ctx.moveTo(x+w, y+h);
		ctx.lineTo(x+w+sizeCrochet, y+h);
		ctx.moveTo(x+w, y+h);
		ctx.lineTo(x+w, y+sizeCrochet+h);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		let fontSiz = 12;
		ctx.font = `400 12px "Courier New"`;
		ctx.fillStyle = fontColor;
		let text = fontSize + "px ["+ padding+"]";
		let b = ctx.measureText(text);
		let y2 = y + h + fontSiz + 4;
		if (y2 + fontSiz > canvas.width) {
			y2 = y + h - fontSiz - 4;
		}
		ctx.fillText(text, canvas.width / 2 - b.width / 2, y2);
		ctx.closePath();

		if (easter == true) {
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.fillRect((canvas.width ) / 2 - 2, (canvas.height ) / 2 - 2, 4, 4);
			ctx.stroke();
			ctx.closePath();
		}
}

function updateSaturation() {
	let hhu = Math.round(hue*355);
	let uuu = 'linear-gradient(to right, hsl('+hhu+', 0%, 50%) 0%, hsl('+hhu+', 100%, 50%) 100%)';
	document.getElementById("saturation").style.background =uuu ;
	updateLuminance();
}

function updateLuminance() {
	let hhu = Math.round(hue*355);
	let ssu = Math.round(saturation*100);
	let uuu = 'linear-gradient(to right, hsl('+hhu+','+ssu+'%, 1%) 0%, hsl('+hhu+','+ssu+'%, 50%) 50%, hsl('+hhu+','+ssu+'%, 100%) 100%)';
	document.getElementById("luminance").style.background =uuu ;
	updateAlpha();
}

function updateAlpha() {
	let hhu = Math.round(hue*355);
	let ssu = Math.round(saturation*100);
	let lsu = Math.round(luminance*100);
	let uuu = 'linear-gradient(to right, hsla('+hhu+','+ssu+'%,'+lsu+'%, 0) 0%, hsla('+hhu+','+ssu+'%,'+lsu+'%, 0.5) 50%, hsla('+hhu+','+ssu+'%,'+lsu+'%, 1) 100%)';
	document.getElementById("alpha").style.background=uuu ;
}

function registerCss(url, css) {
	let doc = document.implementation.createHTMLDocument("");
	let styleElement = document.createElement("style");
	styleElement.textContent = css;
	// the style will only be parsed once it is added to a document
	doc.body.appendChild(styleElement);
	let result = Array.from(styleElement.sheet.cssRules).filter(x => x.style != undefined && x.style.content != undefined && x.style.content.length > 0);
	result = result.map((x) => {
		return { name: x.selectorText.replace(":before", "").replace(":", "").substring(1), character: x.style.content.replace("\"", "").replace("\"", "") }
	});
	result = { url: url, items: result};
	cacheCss[url] = result;
	return Promise.resolve(result);
}

function registerCss2(url, css) {
	let styleElement = document.createElement("style");
	styleElement.textContent = css;
	// the style will only be parsed once it is added to a document
	document.body.appendChild(styleElement);
	let result = Array.from(styleElement.sheet.cssRules).filter(x => x.selectorText.indexOf("dims")>0 && x.style != undefined);
	result = result.map((x) => {
		return { name: x.selectorText.replace("-dims", "").substring(1), w: x.style.width, h: x.style.height }
	});
	result = { url: url, items: result};
	cacheCss[url] = result;
	return Promise.resolve(result);
}

function getCss2(url) {
	if (url == undefined) {
		return Promise.resolve({css: undefined, url: url, items: []});
	} 
	if (cacheCss[url] != undefined) {
		return Promise.resolve(cacheCss[url]);
	}

	let httpquery = require("@pdulvp/httpquery");
	return httpquery.get(url).then(e => {
		return registerCss2(url, e);
	});
}

function getCss(url) {
	if (url == undefined) {
		return Promise.resolve({css: undefined, url: url, items: []});
	} 
	if (cacheCss[url] != undefined) {
		return Promise.resolve(cacheCss[url]);
	}

	let httpquery = require("@pdulvp/httpquery");
	return httpquery.get(url).then(e => {
		return registerCss(url, e);
	});
}

function getJson(url) {
	if (url == undefined) {
		return Promise.resolve({css: undefined, url: url, items: []});
	} 
	if (cacheJson[url] != undefined) {
		return Promise.resolve(cacheJson[url]);
	}

	let httpquery = require("@pdulvp/httpquery");
	return httpquery.get(url).then(e => {
		let data = JSON.parse(e);
		cacheJson[url] = data;
		return Promise.resolve(data);
	});
}

function getHslColor() {
	let hsl = [ hue * 360, saturation * 100, luminance  * 100, alpha ];
	return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${hsl[3]})`;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function updateImages(clean) {
	if (clean !== false) {
		document.getElementById('okok').innerHTML = '';
	}

	fonts.filter(x => !x.visible).forEach(x =>  {
		let separator = getSeparator(x.name);
		if (separator != undefined) {
			separator.parentNode.removeChild(separator);
		}
		let container = getContainer(x.name);
		if (container != undefined) {
			container.parentNode.removeChild(container);
		}
	});

	let mainLuminance = 1; //0.82
	console.log(hue);
	if (hue < 0) {
		mainColor = "rgb(0, 0, 0)"; //CCCCCC
		document.getElementById("filterGrs").setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0");
		document.getElementById("filterHue").setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0");

	} else {
		mainColor = "rgb(220, 220, 220)"; //CCCCCC
		mainLuminance = 220/255; //0.82
		let sp = 0;
		let rsp = `${0.2126 + 0.7874 * sp} ${0.7152 - 0.7152 * sp} ${0.0722 - 0.0722 * sp} 0 0`;
		let gsp = `${0.2126 - 0.2126 * sp} ${0.7152 + 0.2848 * sp} ${0.0722 - 0.0722 * sp} 0 0`;
		let bsp = `${0.2126 - 0.2126 * sp} ${0.7152 - 0.7152 * sp} ${0.0722 + 0.9278 * sp} 0 0`;
		let asp = `0.000 0.000 0.000 1 0`;
		document.getElementById("filterGrs").setAttribute("values", `${rsp} ${gsp} ${bsp} ${asp}`);

		let ch = require("@pdulvp/colors").hslToRgb(hue-0.01, 1, 0.5).map(c => c/255.0);
		let rh = `${ch[0]} 0 0 0 0`;
		let gh = `0 ${ch[1]} 0 0 0`;
		let bh = `0 0 ${ch[2]} 0 0`;
		let ah = `0 0 0 1 0`;
		document.getElementById("filterHue").setAttribute("values", `${rh} ${gh} ${bh} ${ah}`);

	}

	let s = saturation;
	let r7 = `${0.213+0.787*s} ${0.715-0.715*s} ${0.072-0.072*s} 0 0`;
	let g7 = `${0.213-0.213*s} ${0.715+0.285*s} ${0.072-0.072*s} 0 0`;
	let b7 = `${0.213-0.213*s} ${0.715-0.715*s} ${0.072+0.928*s} 0 0`;
	let a7 = `0 0 0 1 0`;
	document.getElementById("filterSat").setAttribute("values", `${r7} ${g7} ${b7} ${a7}`);

	let r5 = `1 0 0 0 ${((luminance-(1-mainLuminance))*2-1)}`;
	let g5 = `0 1 0 0 ${((luminance-(1-mainLuminance))*2-1)}`;
	let b5 = `0 0 1 0 ${((luminance-(1-mainLuminance))*2-1)}`;
	let a5 = `0 0 0 1 0`;
	document.getElementById("filterLum").setAttribute("values", `${r5} ${g5} ${b5} ${a5}`);

	let gamma = 1 + (1 - mainLuminance);
	document.getElementById("filterGammaR").setAttribute("amplitude", gamma);
	document.getElementById("filterGammaG").setAttribute("amplitude", gamma);
	document.getElementById("filterGammaB").setAttribute("amplitude", gamma);
	document.getElementById("filterAlpha").setAttribute("slope", `${alpha}`);
	
	let visibleFonts = fonts.filter(x => x.visible);
	let toLoadFonts = fonts.filter(x => x.visible && x.loaded !== true);
	console.log(visibleFonts);

	document.fonts.ready.then(e => {
		let promises = toLoadFonts.map(x => {
			if (x.fontType == "svg") {
				return loadSVGFont(x);
			} else {
				return loadFontFace(x);
			}
		});

		if (promises.length == 0) {
			return Promise.resolve([]);
		}
		return Promise.allSettled(promises);

	}).then(e => {
		let visibleFonts = fonts.filter(x => x.visible);
		return Promise.all(visibleFonts.map(f => {
			createsSeparator(f);
			let container = createContainer(f.name);
			let color = getHslColor();
			f.items.forEach(item => {
				createsImage(item, color, f, container);
			});
			return Promise.resolve("ok:"+f.items.length);
		}));

	}).then(e => {
		console.log("Fonts created");
		console.log(e);
		drawVisibleCanvas();

	}).catch(error => {
		console.log(error);
	});

	function loadSVGFont(f) {
		let httpquery = require("@pdulvp/httpquery");
		return httpquery.get(f.fontUrl).then(e => {
			let div = document.createElement("div");
			div.innerHTML = e;
			return Promise.resolve(div);
			
		}).then(svgDiv => {
			let symbols = svgDiv.children[0].getElementsByTagName("svg");
			svgDiv.style.display = "none";
			f.items = [];
			for (let s of symbols) {
				s.removeAttribute("x");
				s.removeAttribute("y");
				s.removeAttribute("width");
				s.removeAttribute("height");
				
				f.items.push({
					"name": s.getAttribute("id")
				});
			}
			f.svg = svgDiv.children[0];
			document.body.appendChild(svgDiv);
			return Promise.resolve(f);

		});
	}

	function loadFontFace(f) {
		let fontface = new FontFace(f.family, 'url('+f.fontUrl+')', { style: f.style, weight: f.weight });
		return fontface.load().then(e => {
			console.log(e);
			document.fonts.add(e);

		}).then(e => {
			return document.fonts.ready;
			
		}).then(e => {
			if (f.jsonUrl != undefined) {
				console.log("Load json: "+f.jsonUrl);
				return getJson(f.jsonUrl).then(json => {
					console.log("Loaded json: ");
					console.log(json);
					//fonts.filter(x => x.name == f.name)[0].items = css.items;
					f.json = json;
					return Promise.resolve(f);
				});
			} 
			return Promise.resolve(f);
		}).then(e => {
			if (f.cssUrl != null) {
				return getCss(f.cssUrl).then(css => {
					console.log("Loaded css: "+css.url);
					console.log(css);
					//fonts.filter(x => x.name == f.name)[0].items = css.items;
					f.items = css.items;
					return Promise.resolve(f);
				});
			} else if (f.jsonUrl != undefined) {
				let res = "";
				f.json.forEach(function (icon) {
					res += `.${f.name}-${icon.name}::before { content: "\\${icon.code}"; }\n`;
				});
				return registerCss(f.jsonUrl, res).then(css => {
					console.log("Loaded created css: "+css.url);
					console.log(css); 
					f.items = css.items;
					return Promise.resolve(f);
				});
			}

		}).then(f => {
			console.log("Loaded font: "+f.name);
			console.log(f);
			f.loaded = true;
			return Promise.resolve(f);
		});
	}

}


function getContainer(fontName) {
	return document.getElementById("container-"+fontName);
}

function createContainer(fontName) {
	let container = getContainer(fontName);
	if (container == undefined) {
		container = document.createElement("div");
		container.setAttribute("id", "container-"+fontName);
		addClass(container, "canvases-container2");
		document.getElementById('okok').appendChild(container);
	}
	return container;
}

function getSeparator(fontName) {
	return document.getElementById("separator-"+fontName);
}

function selectFont(font) {
	console.log(font);
	let container = getContainer(font);
	if (container != null) {
		let items = Array.from(container.getElementsByClassName("active"));
		if (items.length > 0) {
			items.forEach(x => removeClass(x, "active"));
		} else {
			items = Array.from(container.getElementsByClassName("canvases"));
			items.forEach(i => addClass(i, "active"));
		}
	}

}
function createsSeparator(font) {
	let container = getSeparator(font.name);
	if (container == undefined) {
		container = document.createElement("div");
		container.setAttribute("id", "separator-"+font.name);
		
		let text = document.createElement("div");
		text.textContent = font.name;
		text.onclick = function(e) {
			selectFont(font.name);
		};
		container.appendChild(text);
		
		let metas = document.createElement("div");
		addClass(metas, "separator-metas");
		container.appendChild(metas);

		if (font.meta.version) {
			let version = document.createElement("div");
			version.textContent = font.meta.version;
			metas.appendChild(version);
		}

		let mainPage = document.createElement("div");
		let mainPageLink = document.createElement("a");
		mainPageLink.title = `Website: ${font.meta.mainPage}`;
		mainPageLink.textContent = font.meta.mainPage;
		mainPageLink.href = font.meta.mainPageLink;
		mainPage.appendChild(mainPageLink);
		metas.appendChild(mainPage);

		let license = document.createElement("div");
		let licenseLink = document.createElement("a");
		licenseLink.title = `license: ${font.meta.license}`;
		licenseLink.textContent = font.meta.license;
		licenseLink.href = font.meta.licenseLink;
		license.appendChild(licenseLink);
		metas.appendChild(license);

		let author = document.createElement("div");
		let authorLink = document.createElement("a");
		authorLink.title = `Author(s): ${font.meta.author}`;
		authorLink.textContent = font.meta.author;
		authorLink.href = font.meta.authorLink;
		author.appendChild(authorLink);
		metas.appendChild(author);

		addClass(container, "canvases-separator");
		document.getElementById('okok').appendChild(container);
	}
	return container;
}

function checkVisible(elm) {
	let top = elm.getBoundingClientRect().top;
	return (top > 100 && top < window.innerHeight + 100);
}

function updateWindow(event) {
	if (!ticking) {
		window.requestAnimationFrame(function() {
		  drawVisibleCanvas();
		  ticking = false;
		});
		ticking = true;
	}
}
window.addEventListener('scroll', updateWindow);
window.onresize = updateWindow;

function drawAbout() {
	if (raf != null) {
		window.cancelAnimationFrame(raf);
		clearTimeout(raf);
		raf = null;
	}
	let img22 = new Image();
	let img23 = new Image();
	let img24 = new Image();
	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");
	let yy = 10;
	let sens = 1;

	function drawProut() {
		yy += 0.2 * sens;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img22, 20 + yy, 30, 100, 100);
		ctx.drawImage(img23, 35 - yy / 2, 30, 100, 100);
		if (yy > 15 && sens == 1) {
			sens = -1;
		} else if (yy < 0 && sens == -1) {
			sens = 1;
		}
		ctx.drawImage(img24, 30, 30, 100, 100);
		raf = window.requestAnimationFrame(drawProut);
	}

	img22.onload = function(e) {
		img23.onload = function(e) {
			img24.onload = function(e) {
				raf = window.requestAnimationFrame(drawProut);
			}
			img24.src = "svg/about.svg";
		}
		img23.src = "svg/about-light-2.svg";
	}
	img22.src = "svg/about-light.svg";
}

function drawSponsor() {
	if (raf != null) {
		window.cancelAnimationFrame(raf);
		clearTimeout(raf);
		raf = null;
	}
	let img22 = new Image();
	let img23 = new Image();
	let img24 = new Image();
	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");

	let images = [() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img24, 30, 30, 100, 100);
	}, () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img24, 30, 30, 100, 100);
		ctx.drawImage(img22, 30, 30, 100, 100);
	}, () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img24, 30, 30, 100, 100);
		ctx.drawImage(img22, 30, 30, 100, 100);
		ctx.drawImage(img23, 30, 30, 100, 100);
	}, () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img24, 30, 30, 100, 100);
		ctx.drawImage(img23, 30, 30, 100, 100);
	}];

	function drawProut() {
		images[Math.floor(Math.random()*(images.length))]();
		raf = setTimeout(drawProut, 550 + Math.floor(Math.random()*200));
	}

	img22.onload = function(e) {
		img23.onload = function(e) {
			img24.onload = function(e) {
				raf = window.requestAnimationFrame(drawProut);
			}
			img24.src = "svg/sponsor.svg";
		}
		img23.src = "svg/sponsor-light-2.svg";
	}
	img22.src = "svg/sponsor-light.svg";
}


function drawImage(svgName) {
	if (svgName == "about") {
		drawAbout();
		return;
	}
	if (svgName == "sponsor") {
		drawSponsor();
		return;
	}
	let img22 = new Image();
	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");
	img22.onload = function(e) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img22, 30, 30, 100, 100);
	}
	img22.src = "svg/"+svgName+".svg";
}
let raf = null;

function clearAnimation() {
	if (raf != null) {
		window.cancelAnimationFrame(raf);
		clearTimeout(raf);
		raf = null;
	}

	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	raf = setTimeout(updateSize, 200);
}

function keyListener(e) {
	if ("Escape" == e.code || "Space" == e.code || "Enter" == e.code) {
		if (Array.from(document.getElementsByClassName("modal")).filter(x => x.getAttribute("class").indexOf("modal-hide")==-1).length > 0) {
			hideModal();
			clearAnimation();
			event.preventDefault();
		}
	}
	if ("Escape" == e.code) {
		let items = Array.from(document.getElementsByClassName("active"));
		if (items.length > 0) {
			items.forEach(x => removeClass(x, "active"));
			event.preventDefault();
		}
	}
}
document.addEventListener('keydown', keyListener);
let mainColor = "";

function drawCanvas(canvas) {
	try {
		if (canvas.getAttribute("dirty") == "true") {
			
		if (canvas.getAttribute("font-type") != "svg") {
			var ctx = canvas.getContext("2d");
			ctx.textBaseline = "middle";
			ctx.imageSmoothingEnabled = false;
			ctx.textAlign = 'center';

			var x = Math.floor(canvas.width / 2);
			var y = Math.floor(canvas.height / 2);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (!translucentBackground) {
				ctx.beginPath();
				ctx.filter = "none";
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.closePath();
			}

			ctx.font = canvas.getAttribute("font");
			ctx.beginPath();
			ctx.filter = "url(#filterMatrix)";
			ctx.fillStyle = mainColor; //sepia canvas.getAttribute("font-color");
			ctx.fillText(canvas.getAttribute("font-character"), x, y);
			ctx.closePath();
			canvas.setAttribute("dirty", "false");

		} else {
			/*var ctx = canvas.getContext("2d");
			ctx.textBaseline = "middle";
			ctx.imageSmoothingEnabled = false;
			ctx.textAlign = 'center';
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			//let image = canvas.getElementsByTagName("img")[0];
			//if (image.getAttribute("loaded") == "true") {
			ctx.fillStyle = mainColor; //sepia canvas.getAttribute("font-color");
			let font = fonts.filter(x => x.name == canvas.getAttribute("font-name"))[0];
			*/
			//ctx.filter = "url(#filterMatrix)";
			//ctx.drawImage(font.img, 0, 0, 300, 300,0,0,300,300);
			//canvas.setAttribute("dirty", "y");
			//} else {
			//	let fct = function() {
			//		ctx.drawImage(image, padding, padding);
			//		canvas.setAttribute("dirty", "false");
			//	};
			//	image.addEventListener ("load", fct, true);
			//}
		}
	}

	} catch (error) {
		console.log(error);
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.filter = "none";
		ctx.fillStyle = "rgb(255, 100, 100)";
		ctx.fillRect(0, 0, 5, 5);
		ctx.closePath();
	}
}

let visibles = null;

function drawVisibleCanvas() {
	let toDraw = Array.from(document.getElementsByTagName("canvas")).filter(x => hasClass(x, "canvases") && x.getAttribute("dirty") == "true");
	
	let firstVisible = -1;
	let lastVisible = -1;
	for (var i = 0; i < toDraw.length; i++) {
		if (firstVisible == -1 && checkVisible(toDraw[i])) {
			firstVisible = i;
		} else if (firstVisible > -1 && !checkVisible(toDraw[i])) {
			lastVisible = i;
			break;
		}
	}
	toDraw = toDraw.slice(firstVisible, lastVisible);
	console.log("f="+firstVisible);
	console.log("l="+lastVisible);
	visibles = toDraw;

	visibles.forEach(canvas => {
		drawCanvas(canvas);
	});
}

function createsImage(element, color, font, rootContainer) {
	let id = `${element.name}-${font.weight}-${font.family}`;

	let img = document.getElementById(id);
	if (document.getElementById(id) == undefined) {
		img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		img.setAttribute("id", id);
		img.setAttribute("title", element.name);
		addClass(img, "canvases");
		addClass(img, element.name);

		let uses = document.createElementNS("http://www.w3.org/2000/svg", "use");
		uses.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${element.name}`);
		uses.setAttribute("fill", mainColor);
		uses.setAttribute("style", `filter: url(#filterMatrix);`);
		img.appendChild(uses);
		
		let container = document.createElement("div");
		addClass(container, "canvases-container");
		
		rootContainer.appendChild(container);
		container.appendChild(img);
		img.onclick = totototo;
		dirty = true;
	}

	if (img.getAttribute("infpad") != padding) {
		img.setAttribute("infpad", padding);
		img.firstChild.setAttribute("x", padding);
		img.firstChild.setAttribute("y", padding);
		dirty = true;
	}
	if (img.width != fontSize) {
		img.setAttribute("width", fontSize);
		img.firstChild.setAttribute("width", fontSize - 2 * padding);
		dirty = true;
	}
	if (img.height != fontSize) {
		img.setAttribute("height", fontSize);
		img.firstChild.setAttribute("height", fontSize - 2 * padding);
		dirty = true;
	}
	if (dirty) {
		img.setAttribute("dirty", "true");
	}
}
