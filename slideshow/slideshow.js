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
	if (!ot) {
		ot = nt;
		if (isNaN(slideShow[k].slideTimer)) { slideShow[k].slideTimer = 500; }
	}
	td = nt - ot;
	if (slideShow[k].slideTimer <= td) {
		slideShow[k].sliding = false;
		slideShow[k].slideTimer = 500;
		hostRef.childNodes[2].style.bottom = (slideShow[k].controls ? 0 : -50) + "px";
		hostRef.childNodes[3].style.bottom = (slideShow[k].controls ? 0 : -50) + "px";
	} else { 
		slideShow[k].slideTimer -= td;
		pos = slideShow[k].slideTimer / 500;
		if (!slideShow[k].controls) { pos = 1 - pos; }
		hostRef.childNodes[2].style.bottom = -pos * 50 + "px";
		hostRef.childNodes[3].style.bottom = -pos * 50 + "px";
		setTimeout("slideControls(" + k + "," + nt + ")", 50);
	}
}
function overAndOut(state, k) {
	if (slideShow[k].controls != state) {
		slideShow[k].controls = state;
		if (state) {
			clearTimeout(slideShow[k].controlsTimer);
			if (document.getElementById(slideShow[k].host).childNodes[2].style.bottom != "0px" && !slideShow[k].sliding) { slideControls(k); }
		} else {
			clearTimeout(slideShow[k].controlsTimer);
			slideShow[k].controlsTimer = setTimeout("slideControls(" + k + ")", 500);
		}
	}
}
function startslideShow(info) {
	var hostRef = document.getElementById(info.host);
	if (hostRef && info.imgs.length > 1) {
		var hostW = hostRef.style.width, hostH = hostRef.style.height;
		uri = info.imgs[0].uri ? info.imgs[0].uri : (info.uri ? info.uri : "");
		uri = uri ? ' href="' + uri + '"' : "";
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
		k = slideShow.push(info) - 1;
		controls = hostRef.childNodes[3].childNodes[0].childNodes[0];
		if (document.all) {
			controls.childNodes[0].attachEvent("onclick", function() { changeFrame(-2, k); });
			controls.childNodes[1].attachEvent("onclick", function() { togglePause(k); });
			controls.childNodes[2].attachEvent("onclick", function() { changeFrame(0, k); });
			hostRef.attachEvent("onmouseover", function() { overAndOut(true, k); });
			hostRef.attachEvent("onmouseout", function() { overAndOut(false, k); });
		} else {
			controls.childNodes[0].addEventListener("click", function() { changeFrame(-2, k); }, false);
			controls.childNodes[1].addEventListener("click", function() { togglePause(k); }, false);
			controls.childNodes[2].addEventListener("click", function() { changeFrame(0, k); }, false);
			hostRef.addEventListener("mouseover", function() { overAndOut(true, k); }, false);
			hostRef.addEventListener("mouseout", function() { overAndOut(false, k); }, false);
		}
		info.timer = setTimeout("fadeFrame(" + k + ")", info.imgs[0].holdTime ? info.imgs[0].holdTime : info.holdTime);
	}
}