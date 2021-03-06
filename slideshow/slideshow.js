var slideShow = [];
function mod(a, b) {
	return ((a % b) + b) % b;
}
function getFrame(o, k) {
	ro = mod(slideShow[k].frame + o, slideShow[k].imgs.length);
	return ro;
}
function switchFrame(k) {
	var hostRef = document.getElementById(slideShow[k].host);
	slideShow[k].fading = false;
	if (!document.all) {
		hostRef.childNodes[0].style.opacity = 1;
	} else {
		hostRef.childNodes[0].style.filter = 'alpha(opacity = 100)';
	}
	document.getElementById(slideShow[k].host + "I1").src = slideShow[k].imgs[slideShow[k].frame].src;
	document.getElementById(slideShow[k].host + "I1").alt = slideShow[k].imgs[slideShow[k].frame].alt;
	var nextFrame = getFrame(1, k);
	document.getElementById(slideShow[k].host + "I2").src = slideShow[k].imgs[nextFrame].src;
	document.getElementById(slideShow[k].host + "I2").alt = slideShow[k].imgs[nextFrame].alt;
	slideShow[k].fadeTimer = slideShow[k].fadeTime;
	if (slideShow[k].paused != true) {
		slideShow[k].timer = setTimeout("fadeFrame(" + k + ")", slideShow[k].imgs[slideShow[k].frame].holdTime ? slideShow[k].imgs[slideShow[k].frame].holdTime : slideShow[k].holdTime);
	}
	slideShow[k].frame = nextFrame;
}
function changeFrame(n, k) {
	var hostRef = document.getElementById(slideShow[k].host);
	clearTimeout(slideShow[k].timer);
	slideShow[k].frame = getFrame(n, k);
	if (n < 0) {
		document.getElementById(slideShow[k].host + "I2").src = slideShow[k].imgs[slideShow[k].frame].src;
		document.getElementById(slideShow[k].host + "I2").alt = slideShow[k].imgs[slideShow[k].frame].alt;
	}
	hostRef.childNodes[3].childNodes[1].innerHTML = (slideShow[k].frame + 1) + ' / ' + slideShow[k].imgs.length;
	fadeFrame(k, true);
}
function togglePause(k) {
	if (slideShow[k].paused == true) {
		slideShow[k].paused = false;
		if (slideShow[k].fading != true) { fadeFrame(k); }
	} else {
		slideShow[k].paused = true;
		if (slideShow[k].fading != true) { clearTimeout(slideShow[k].timer); }
	}
	ppButton = document.getElementById(slideShow[k].host).childNodes[3].childNodes[0].childNodes[0].childNodes[1];
	ppButton.style.backgroundPosition = (slideShow[k].paused ? -20 : -10) + 'px 0';
	ppButton.title = ppButton.innerHTML = slideShow[k].paused ? "Play" : "Pause";
}
function fadeFrame(k, fast, ot) {
	var hostRef = document.getElementById(slideShow[k].host);
	var nt = new Date().getTime();
	slideShow[k].fading = true;
	if (!ot) {
		ot = nt;
		uri = slideShow[k].imgs[slideShow[k].frame].uri ? slideShow[k].imgs[slideShow[k].frame].uri : (slideShow[k].uri ? slideShow[k].uri : "");
		if (uri != "") {
			hostRef.childNodes[0].childNodes[0].setAttribute("href", uri);
		} else {
			hostRef.childNodes[0].childNodes[0].removeAttribute("href");
		}
		hostRef.childNodes[3].childNodes[1].innerHTML = (slideShow[k].frame + 1) + ' / ' + slideShow[k].imgs.length;
		if (fast) {
			//won't handle passing 2 frames, but stuff would need work to support doing such fades. :S
			slideShow[k].fadeTimer = (slideShow[k].fadeTimer / slideShow[k].fadeTime) * slideShow[k].fastFadeTime;
		}
	}
	td = nt - ot;
	if (slideShow[k].fadeTimer <= td) {
		switchFrame(k);
	} else { 
		slideShow[k].fadeTimer -= td;
		opacity = slideShow[k].fadeTimer / (fast ? slideShow[k].fastFadeTime : slideShow[k].fadeTime);
		if (!document.all) {
			hostRef.childNodes[0].style.opacity = opacity;
		} else {
			hostRef.childNodes[0].style.filter = 'alpha(opacity = '  + (opacity * 100) + ')';
		}
		slideShow[k].timer = setTimeout("fadeFrame(" + k + "," + fast + "," + nt + ")", 50);
	}
}
function slideControls(k, ot) {
	var hostRef = document.getElementById(slideShow[k].host);
	var nt = new Date().getTime();
	slideShow[k].sliding = true;
	if (!ot) { ot = nt; }
	td = nt - ot;
	if ((slideShow[k].controls && slideShow[k].slideTimer <= td) || (!slideShow[k].controls && slideShow[k].slideTimer + td >= slideShow[k].slideTime)) {
		slideShow[k].sliding = false;
		slideShow[k].slideTimer = slideShow[k].controls ? 0 : slideShow[k].slideTime;
		hostRef.childNodes[2].style.bottom = (slideShow[k].controls ? 0 : -50) + "px";
		hostRef.childNodes[3].style.bottom = (slideShow[k].controls ? 0 : -50) + "px";
	} else { 
		slideShow[k].slideTimer += slideShow[k].controls ? -td : td;
		pos = slideShow[k].slideTimer / slideShow[k].slideTime;
		hostRef.childNodes[2].style.bottom = -pos * 50 + "px";
		hostRef.childNodes[3].style.bottom = -pos * 50 + "px";
		setTimeout("slideControls(" + k + "," + nt + ")", 25);
	}
}
function overAndOut(state, k) {
	if (slideShow[k].controls != state) {
		slideShow[k].controls = state;
		if (state && !slideShow[k].sliding) {
			clearTimeout(slideShow[k].controlsTimer);
			if (document.getElementById(slideShow[k].host).childNodes[2].style.bottom != "0px") { slideControls(k); }
		} else {
			clearTimeout(slideShow[k].controlsTimer);
			slideShow[k].controlsTimer = setTimeout("slideControls(" + k + ")", slideShow[k].slideTime);
		}
	}
}
function startslideShow(info) {
	var hostRef = document.getElementById(info.host);
	if (hostRef && info.imgs.length > 1) {
		var hostW = hostRef.style.width, hostH = hostRef.style.height;
		uri = info.imgs[0].uri ? info.imgs[0].uri : (info.uri ? info.uri : "");
		uri = uri ? ' href="' + uri + '"' : "";
		if (!info.imgs[info.imgs.length -1]) info.imgs.pop(); //fix for IE
		hostRef.innerHTML = '<div style="position: absolute; z-index: 1;"><a' + uri 
			+ '><img id="' + info.host + 'I1" src="' + info.imgs[0].src + '" alt="' +
			info.imgs[0].alt + '" width="' + hostW + '" height="' + hostH + '" /></a></div>' +
			'<div style="position: absolute; z-index: 0;"><img id="' +
			info.host + 'I2" src="' + info.imgs[1].src + '" alt="' +
			info.imgs[1].alt + '" width="' + hostW + '" height="' + hostH + '" /></div>' +
			'<div class="ssOverlay"></div>' +
			'<div class="ssControls" onselectstart="return false;"><div class="ssControlsC">' +
			'<div><a class="ssPrev" title="Previous">Previous</a>' +
			'<a class="ssPP" title="Pause">Pause</a>' +
			'<a class="ssNext" title="Next">Next</a></div></div>' +
			'<div>1 / ' + info.imgs.length + '</div></div>';
		info.frame = 1;
		info.fadeTime = info.fadeTime ? info.fadeTime : 1000;
		info.fadeTimer = info.fadeTime;
		info.holdTime = info.holdTime ? info.holdTime : 5000;
		info.fastFadeTime = info.fastFadeTime ? info.fastFadeTime : 100;
		info.slideTime = info.slideTime ? info.slideTime : 250; //500 for BBC from the looks of it, but 250 is snappier.
		info.slideTimer = info.slideTime;
		k = slideShow.push(info) - 1;
		var cPreviousFrame = function(input){return function(){changeFrame(-2, input);};}; cPreviousFrame = cPreviousFrame(k);
		var cPause = function(input){return function(){togglePause(input);};}; cPause = cPause(k);
		var cNextFrame = function(input){return function(){changeFrame(0, input);};}; cNextFrame = cNextFrame(k);
		var hMouseOver = function(input){return function(){overAndOut(true, input);};}; hMouseOver = hMouseOver(k);
		var hMouseOut = function(input){return function(){overAndOut(false, input);};}; hMouseOut = hMouseOut(k);
		controls = hostRef.childNodes[3].childNodes[0].childNodes[0];
		if (document.all) {
			controls.childNodes[0].attachEvent("onclick", cPreviousFrame);
			controls.childNodes[1].attachEvent("onclick", cPause);
			controls.childNodes[2].attachEvent("onclick", cNextFrame);
			hostRef.attachEvent("onmouseover", hMouseOver);
			hostRef.attachEvent("onmouseout", hMouseOut);
		} else {
			controls.childNodes[0].addEventListener("click", cPreviousFrame, false);
			controls.childNodes[1].addEventListener("click", cPause, false);
			controls.childNodes[2].addEventListener("click", cNextFrame, false);
			hostRef.addEventListener("mouseover", hMouseOver, false);
			hostRef.addEventListener("mouseout", hMouseOut, false);
		}
		info.timer = setTimeout("fadeFrame(" + k + ")", info.imgs[0].holdTime ? info.imgs[0].holdTime : info.holdTime);
	}
}