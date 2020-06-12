/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/

var colors = require("@pdulvp/colors");

var fonts = [ 
	{ name: "font-awesome-regular", visible: true, host: "http://localhost:8082", url: "webfonts/fontawesome.css", fontUrl: "webfonts/fa-regular-400.woff2", weight: 400, family: "aaaa", style: "normal", 
		meta: { version: "5.13.0", licenseLink: "https://fontawesome.com/license/free", license: "icons(CC-BY-4.0) font(SIL-OFL-1.1)", mainPage: "fontawesome.com", mainPageLink: "https://fontawesome.com", author: "by @fontawesome", authorLink: "https://fontawesome.com"  }
	}, 
	{ name: "font-awesome-solid", visible: true, host: "http://localhost:8082", url: "webfonts/fontawesome.css", fontUrl: "webfonts/fa-solid-900.woff2", weight: 900, family: "bbbb", style: "normal", 
		meta: { version: "5.13.0", licenseLink: "https://fontawesome.com/license/free", license: "icons(CC-BY-4.0) font(SIL-OFL-1.1)", mainPage: "fontawesome.com", mainPageLink: "https://fontawesome.com", author: "by @fontawesome", authorLink: "https://fontawesome.com"  }
	}, 
	{ name: "font-awesome-brands", visible: false, host: "http://localhost:8082", url: "webfonts/fontawesome.css", fontUrl: "webfonts/fa-brands-400.woff2", weight: 400, family: "cccc", style: "normal",
		meta: { version: "5.13.0", licenseLink: "https://fontawesome.com/license/free", license: "icons(CC-BY-4.0) font(SIL-OFL-1.1)", mainPage: "fontawesome.com", mainPageLink: "https://fontawesome.com", author: "by @fontawesome", authorLink: "https://fontawesome.com"  }
	},
	{ name: "fontelico", visible: false, host: "http://localhost:8082", url: "webfonts/fontelico-codes.css", fontUrl: "webfonts/fontelico.woff2", weight: "normal", family: "dddd", style: "normal",
		meta: { licenseLink: "https://github.com/fontello/fontelico.font#license", license: "icons(CC-BY-3.0) font(SIL-OFL-1.1)", mainPage: "github.com/fontello/fontelico.font", mainPageLink: "https://github.com/fontello/fontelico.font", author: "by Crowdsourced, for Fontello project", authorLink: "https://github.com/fontello/fontelico.font#contributors" }
	} ];

	

function hasClass(item, value) {
	return item.getAttribute("class") != null && (item.getAttribute("class").includes(value));
}

function removeClass(item, value) {
	if (hasClass(item, value)) {
		item.setAttribute("class", item.getAttribute("class").replace(value, "").trim());
	}
}

function addClass(item, value) {
    if (!hasClass(item, value)) {
        let current = item.getAttribute("class");
        current = current == null ? "" : current;
        item.setAttribute("class", (current+ " "+value+" ").trim());
    }
}

function download() {

	var zip = new JSZip();
	var img = zip.folder("images");
	
	Array.from(document.getElementsByClassName("active")).forEach(e => {
		let url2 = e.toDataURL("image/png");
		img.file(e.getAttribute("title")+".png", url2.split(",")[1], {base64: true});
	});

	zip.generateAsync({type: "blob"})
	.then(function(content) {
		saveAs(content, "example.zip");
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
let luminance = 0.5 + Math.random() / 5;
let alpha = 1;

updateSize();
updateSaturation();

let cacheCss = {};

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

function updateFonts() {
	let fontsUi = document.getElementById("font-chooser");
	fontsUi.innerHTML = "";
	fonts.filter(f => f.visible).forEach(f => fontsUi.appendChild(addFont(f, "font-chooser-item-close", 
		function(e) {
			fonts.filter(f => f.name == e.target.parentNode.getAttribute("font-name")).forEach(f => f.visible = false);
			drawAnimationProut();
			updateFonts();
		})));
	if (fonts.filter(f => f.visible == false).length > 0) {
		fontsUi.appendChild(addFontAdd());
	}
	updateImages(false);
}

function updateChoosableFonts() {
	let fontsUi = document.getElementById("modal-font");
	fontsUi.innerHTML = "";
	fonts.filter(f => !f.visible).forEach(f => fontsUi.appendChild(addFont(f, "font-chooser-item-add", 
		function(e) {
			fonts.filter(f => f.name == e.target.parentNode.getAttribute("font-name")).forEach(f => f.visible = true);
			updateFonts();
			hideModal();
			drawAnimationCookie();
		})));
}

function addFontAdd() {
	let root = document.createElement("div");
	addClass(root, "font-chooser-item");
	let text = document.createElement("div");
	text.textContent = name;
	root.setAttribute("font-name", name);
	root.appendChild(text);
	let button = document.createElement("div");
	addClass(button, "font-chooser-item-add");
	button.onclick = (function(e) {
		drawCookieBox(fonts.filter(f => !f.visible).length);
		removeClass(document.getElementById("modal-back"), "modal-hide");
		updateChoosableFonts();
		document.getElementById("modal-font").style.top = e.target.offsetTop + e.target.offsetHeight;
		document.getElementById("modal-font").style.left = e.target.offsetLeft;
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

function addFont(font, classButton, onclick) {
	let root = document.createElement("div");
	addClass(root, "font-chooser-item");
	let text = document.createElement("div");
	text.textContent = font.name;
	root.setAttribute("font-name", font.name);
	root.appendChild(text);
	let button = document.createElement("div");
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
	view.style.top = (window.innerHeight - view.getBoundingClientRect().height) / 4;
	view.style.left = (window.innerWidth - view.getBoundingClientRect().width) / 2;
}

document.getElementById("link-about").onclick = showModal;
document.getElementById("link-sponsor").onclick = showModal;
document.getElementById("link-license").onclick = showModal;

function updateSize() {
	let canvas = document.getElementById("canvases-preview");
	canvas.width = window.getComputedStyle(canvas).width.replace("px", "");
	canvas.height = window.getComputedStyle(canvas).width.replace("px", "");
	document.title = fontSize + " "+ padding;

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

function getCssGet(css) {
	let cssId = css.url;
	var httpquery = require("@pdulvp/httpquery");
	return httpquery.get(css.host, css.url).then(e => {
		var doc = document.implementation.createHTMLDocument(""),
		styleElement = document.createElement("style");
		styleElement.textContent = e;
		// the style will only be parsed once it is added to a document
		doc.body.appendChild(styleElement);
		let result = Array.from(styleElement.sheet.cssRules).filter(x => x.style != undefined && x.style.content != undefined && x.style.content.length > 0);
		result = result.map((x) => {
			return { name: x.selectorText.replace("::before", "").substring(1), character: x.style.content.replace("\"", "").replace("\"", "") }
		});
		result = {css: css, items: result};
		cacheCss[cssId] = result;
		return result;
	});
}
function getCss(css) {
	let cssId = css.url;
	if (cacheCss[cssId] != undefined) {
		return new Promise((resolve, reject) => {
			cacheCss[cssId].css = css;
			console.log("css retrieved from cache");
			resolve(cacheCss[cssId]);
		});
	} else {
		return getCssGet(css);
	}
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

	
	let vfonts = fonts.filter(x => x.visible);
	let lfonts = fonts.filter(x => x.visible && x.loaded !== true);
	console.log(vfonts);

	var fontUrls = lfonts.map(x => x.fontUrl).filter( onlyUnique ).map(x => { return { font: vfonts.filter(f => f.fontUrl == x)[0], fontUrl: x } } );
	console.log(fontUrls);

	var cssUrls = vfonts.map(x => x.url).filter( onlyUnique ).map(x => { return { fonts: vfonts.filter(f => f.url == x), url: x, host: vfonts.filter(f => f.url == x)[0].host } } );
	console.log(cssUrls);
	console.log(document.fonts);

	let fonts2 = fontUrls.map(f => new FontFace(f.font.family, 'url('+f.font.host+"/"+f.fontUrl+')', { style: f.font.style, weight: f.font.weight }));
	
	document.fonts.ready.then(e => {
		if (fonts2.length == 0) {
			return Promise.resolve([]);
		}
		return Promise.allSettled(fonts2.map(f => f.load()));

	}).then(ee => {
		ee.forEach(e => {
			if (e.status == "fulfilled") {
				fonts.filter(x => x.family == e.value.family).forEach(f => f.loaded = true);
				document.fonts.add(e.value);
			} else {
				console.log("Font not registered:"+e);
			}
		});
		return Promise.resolve();

	}).then(e => {
		return document.fonts.ready;
		
	}).then(e => {
		if (fonts2.length != 0) {
			console.log("Fonts registered");
		}
		return Promise.allSettled(cssUrls.map(c => getCss(c)));

	}).then(e => {
		console.log("Css retrieved");
		let res = e.filter(p => p.status == "fulfilled").map(p => p.value).map(result => {
			console.log(result.css.fonts);
			let allFonts = result.css.fonts.map(f => {
				return new Promise((resolve, reject) => {
					createsSeparator(f);
					let container = createContainer(f.name);
					let color = getHslColor();
					result.items.forEach(item => {
						createsImage(item, color, f, container);
					});
					resolve("ok:"+result.items.length);
				});
			}).flat();
			return allFonts;
		}).flat();

		return Promise.allSettled(res);

	}).then(e => {
		console.log("Fonts created");
		console.log(e);
		drawVisibleCanvas();

	}).catch(function(error) {
		console.log(error);
	});

	/*
	createsImage({name: ".fa-500px", character: "\uFFFF"}, "black");
	createsImage({name: ".fa-500px", character: "\uf26e"}, "black");
	createsImage({name: ".fa-s00px", character: "\uf368"}, "black");
	createsImage({name: ".fa-x00px", character: "\uf369"}, "black");
	createsImage({name: ".fa-x00px", character: "\uf2b9"}, "black");
	createsImage({name: ".fa-x00px", character: "\uf037"}, "black");
	*/
		
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

function drawCookieBox(nbCookies) {

	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");
	images = ["svg/cookie-box-5.svg", "svg/cookie-box-4.svg", "svg/cookie-box-3.svg", "svg/cookie-box-2.svg", "svg/cookie-box-1.svg"]; 
	images = images.slice(0, Math.min(nbCookies, images.length));
	let Img = [];
	
	let i = 0;
	let drawImages = function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Img.forEach(i => {
			ctx.drawImage(i, 30, 30, 100, 100);
		})
	};

	let loadImage = function(i) {
		let img22 = new Image();
		if (i < images.length) {
			img22.onload = function(e) {
				loadImage(i + 1);
			}
			img22.src = images[i];
		} else {
			img22.onload = function(e) {
				drawImages();
			}
			img22.src = "svg/cookie-box.svg";
		}
		Img.push(img22);
	};

	loadImage(0);
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

function drawAnimationCookie() {
	if (raf != null) {
		window.cancelAnimationFrame(raf);
		clearTimeout(raf);
		raf = null;
	}
	let img22 = new Image();
	let img23 = new Image();
	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");
	
	function drawCookie() {
		ctx.globalAlpha = 1;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img23, 30, 30, 100, 100);
		raf = setTimeout(clearAnimation, 500);
	}

	img22.onload = function(e) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img22, 30, 30, 100, 100);
		img23.onload = function(e) {
			raf = setTimeout(drawCookie, 300);
		}
		img23.src = "svg/cookie-eat.svg";
	}
	img22.src = "svg/cookie.svg";
}

function drawAnimationProut() {
	if (raf != null) {
		window.cancelAnimationFrame(raf);
		clearTimeout(raf);
		raf = null;
	}
	
	let img22 = new Image();
	let img23 = new Image();
	let canvas = document.getElementById("canvases-preview");
	let ctx = canvas.getContext("2d");
	let yy = 20;
	
	function drawProut() {
		yy += 8;
		if (yy == 28) {
			ctx.globalAlpha = 1;
			ctx.drawImage(img23, 30, 30, 100, 100);
			raf = window.requestAnimationFrame(drawProut);
			
		} else if (yy < 308) {
			ctx.globalAlpha = 0.0094;
			ctx.drawImage(img23, 20, 30-yy*2, 100+yy*2, 100+yy*4);
			raf = window.requestAnimationFrame(drawProut);

		} else {
			clearAnimation();
		}
	}

	img22.onload = function(e) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img22, 30, 30, 100, 100);
		img23.onload = function(e) {
			raf = setTimeout(drawProut, 300);
		}
		img23.src = "svg/prout.svg";
	}
	img22.src = "svg/prout-bar.svg";
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
			drawAnimationProut();
			event.preventDefault();
		}
	}
}
document.addEventListener('keydown', keyListener);


function drawVisibleCanvas() {
	let toDraw = Array.from(document.getElementsByTagName("canvas")).filter(x => hasClass(x, "canvases") && x.getAttribute("dirty") == "true");
	toDraw = toDraw.filter(x => checkVisible(x));

	toDraw.forEach(canvas => {
		var ctx = canvas.getContext("2d");
		ctx.textBaseline = "middle";
		ctx.imageSmoothingEnabled = false;
		ctx.textAlign = 'center';
		ctx.font = canvas.getAttribute("font");

		var x = Math.floor(canvas.width / 2);
		var y = Math.floor(canvas.height / 2);
		ctx.beginPath();
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.fillStyle = canvas.getAttribute("font-color");
		ctx.fillText(canvas.getAttribute("font-character"), x, y);
		ctx.closePath();
		canvas.setAttribute("dirty", "false");
	});
}

function createsImage(element, color, font, rootContainer) {
	let id = `${element.name}-${font.weight}-${font.family}`;
	
	let temporary = document.createElement("canvas");
	temporary.width = fontSize;
	temporary.height = fontSize;
	var tctx = temporary.getContext("2d");
	tctx.imageSmoothingEnabled = false;
	tctx.textBaseline = "middle";
	tctx.textAlign = 'center';

	let fontS = fontSize - padding * 2;
	tctx.font = `${font.weight} ${fontS}px "${font.family}"`;
	let invalid = tctx.measureText("\uFFFF");
	let b = tctx.measureText(element.character);
	if ((invalid.width == b.width && invalid.actualBoundingBoxAscent == b.actualBoundingBoxAscent && invalid.actualBoundingBoxDescent == b.actualBoundingBoxDescent && invalid.actualBoundingBoxLeft == b.actualBoundingBoxLeft && invalid.actualBoundingBoxRight == b.actualBoundingBoxRight)) {
		return;
	}

	while (fontS > 0 && b.width > temporary.width - padding * 2) {
		fontS--;
		tctx.font = `${font.weight} ${fontS}px "${font.family}"`;
		b = tctx.measureText(element.character);
	}

	let dirty = false;
	let canvas = document.getElementById(id);
	if (document.getElementById(id) == undefined) {
		canvas = document.createElement("canvas");
		canvas.setAttribute("id", id);
		canvas.setAttribute("title", element.name);
		addClass(canvas, "canvases");

		let container = document.createElement("div");
		addClass(container, "canvases-container");
		
		rootContainer.appendChild(container);
		container.appendChild(canvas);
		canvas.onclick = totototo;
		dirty = true;
	}
	if (canvas.getAttribute("font-color") != color) {
		canvas.setAttribute("font-color", color);
		dirty = true;
	}
	if (canvas.getAttribute("font-character") != element.character) {
		canvas.setAttribute("font-character", element.character);
		dirty = true;
	}
	if (canvas.getAttribute("font") != tctx.font) {
		canvas.setAttribute("font", tctx.font);
		dirty = true;
	}
	if (canvas.width != fontSize) {
		canvas.width = fontSize;
		canvas.style.width = fontSize; //Edge compatibility
		dirty = true;
	}
	if (canvas.height != fontSize) {
		canvas.height = fontSize;
		canvas.style.height = fontSize; //Edge compatibility
		dirty = true;
	}
	if (dirty) {
		canvas.setAttribute("dirty", "true");
	}
}
