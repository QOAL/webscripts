/*
    Pin board - a AJAX pin board
    Copyright (C) 2008-2010 Scott Ellis

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var tick = 0;
var updating = 0;
var posting = 0;
var mouseX;
var mouseY;
var MXY = "-1,-1";
var overandout = 0;

function randomColor() {
	return "#" + (Math.round(Math.random() * 159) + 96).toString(16) + 
	(Math.round(Math.random() * 159) + 96).toString(16) + (Math.round(Math.random() * 159) + 96).toString(16);
}

//From http://www.somacon.com/p355.php
//Assuming this function is in the 'public domain'.
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

//From http://bytes.com/groups/javascript/522932-number-times-character-occurs-string
//Assuming this function is in the 'public domain'.
String.prototype.count = function(match) {
	var res = this.match(new RegExp(match, "g"));
	if (res==null) { return 0; }
	return res.length;
}

function eventHook(ele, event, func) {
	if (document.all) {
		ele.attachEvent("on" + event, func);
	} else {
		ele.addEventListener(event, func, false);
	}
}

function reloadcheck() {
	if (document.getElementById("pb").style.visibility == "hidden" && updating == 0) {
		tick = tick + 1;
		if (tick >= 10) {
			tick = 0;
			updating = 1;
			ajaxFunction("", "", "pblist", "loading", " Updating...");
			document.getElementById("loading").style.visibility = "visible";
		}
	}
}

function update(evt) {
	mouseX = evt.pageX?evt.pageX:evt.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
	mouseY = evt.pageY?evt.pageY:evt.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
	var pb = document.getElementById("pb").style;
	if (overandout == 0 && posting == 0) {
		if (pb.visibility == "visible") {
			pb.visibility = "hidden";
			document.getElementById("status").style.visibility = "hidden";
			pb.left = "0px";
			pb.top = "0px";
		} else {
			document.getElementById("msg").style.background = randomColor();
			document.getElementById("status").style.background = document.getElementById("msg").style.background;
			pb.left = mouseX + "px";
			pb.top = mouseY + "px";
			pb.visibility = "visible";
			MXY = mouseX + "," + mouseY;
			document.getElementById("msg").focus();
			/*Something to move the okay button when the button is off the top would be nice :/ */
		}
	}
}

function postmsg() {
	statusEle = document.getElementById("status");
	if (mouseX < 0 | mouseY < 0 | mouseX > boardSizeX | mouseY > boardSizeY) {
		statusEle.innerHTML = "Position out of bounds.";
	} else {
		if (document.getElementById("msg").value.trim() != "") {
			if (updating == 0 && posting == 0) {
				ajaxFunction(document.getElementById("msg").value,MXY,"pbpost","status"," Posting...");
				posting = 1;
			} else {
				statusEle.innerHTML = "Wait a sec; updating...";
			}
		} else {
			statusEle.innerHTML = "No message to post. :(";
		}
	}
	statusEle.style.visibility = "visible";
	statusEle.style.width = statusEle.innerHTML.getWidth() + "px";
}

//Needed for the text areas style when getting width. Work around? :S
rStyle = {"fontsize": "12px", "fontFamily": "verdana, arial, helvetica, sans-serif", "padding": "5px"};

String.prototype.getWidth = function() {
	var test = document.createElement("span");
	document.body.appendChild(test);
	test.style.visibility = "hidden";
	test.className = 'pbm';
	test.innerHTML = this;
	var w = test.offsetWidth;
	document.body.removeChild(test);
	return w;
}

function resize() {
	var str = document.getElementById("msg").value;
	document.getElementById("msg").rows = str.count("\n") + 1;
	//Doesn't add a line if the new line is currently blank
	//Also could this whole size duping be done in a better way?
	var foo = str.split("\n");
	var longest = "";
	for (x = 0; x < foo.length; x++) {
		if (foo[x].length > longest.length) {
			longest = foo[x];
		}
	}
	document.getElementById("msg").style.width = longest.getWidth() + 10 + "px";
}

function pbInit() {
	setInterval(reloadcheck, 1000);
	document.getElementById("msgs").style.width = boardSizeX + 'px';
	document.getElementById("msgs").style.height = boardSizeY + 'px';
	eventHook(document, "click", update);
	eventHook(document.getElementById("pb"), "mouseover", function() { overandout = 1; });
	eventHook(document.getElementById("pb"), "mouseout", function() { overandout = 0; });
	eventHook(document.getElementById("msg"), "keypress", resize);
	eventHook(document.getElementById("msg"), "keyup", resize);
	var msgs = document.getElementById("msgs").childNodes;
	for (var i = 0; i < msgs.length; i++) {
		if (msgs[i].innerHTML) {
			foo = msgs[i].innerHTML.replace("<br />", "\n").split("\n");
			longest = "";
			for (x = 0; x < foo.length; x++) {
				if (foo[x].length > longest.length) {
					longest = foo[x];
				}
			}
			msgs[i].style.width = longest.getWidth() + "px";
		}
	};
}

//The function could be made much nicer!
function ajaxFunction(str, str2, type, resid, waitmsg) {
	var resEle = document.getElementById(resid);
	var xmlHttp;
	try {
		xmlHttp = new XMLHttpRequest();
	} catch (e) {
	try {
		xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {
			alert("Your browser does not support AJAX!");
			return false;
			}
		}
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState==4) {
			if (xmlHttp.status == 200) {
				var rchar = xmlHttp.responseText.substr(0, 1);
				var rstr = xmlHttp.responseText.substr(1);
				if (rchar == "P") { //post reply
					if (rstr.substr(0, 1) == "P") {
						var pstr = rstr.substr(1);
						var timepos = pstr.search(/T/);
						if (timepos != -1) {
							unixTime = pstr.substr(0,timepos);
							pstr = pstr.substr(timepos+1);
						}
						document.getElementById('pb').style.visibility = "hidden";
						document.getElementById('msgs').innerHTML += pstr;
						document.getElementById('msg').value = "";
						resEle.innerHTML = "";
						resEle.style.visibility = "hidden";
						var msgs = document.getElementById("msgs").childNodes;
						for (var i = 0; i < msgs.length; i++) {
							if (msgs[i].innerHTML && msgs[i].style.width == '') {
								foo = msgs[i].innerHTML.replace("<br />", "\n").split("\n");
								longest = "";
								for (x = 0; x < foo.length; x++) {
									if (foo[x].length > longest.length) {
										longest = foo[x];
									}
								}
								msgs[i].style.width = longest.getWidth() + "px";
								msgs[i].style.display = 'block';
							}
						};
					} else {
						resEle.style.visibility = "visible";
						resEle.innerHTML = rstr;
						resEle.style.width = rstr.getWidth() + "px";
					}
					posting = 0;
				} else { //list reply
					var timepos = rstr.search(/T/);
					if(timepos != -1) {
						unixTime = rstr.substr(0, timepos);
						rstr = rstr.substr(timepos + 1);
					}
					document.getElementById('msgs').innerHTML += rstr;
					updating = 0;
					resEle.style.visibility = "hidden";
				}
				tick = 0;
			} else {
				resEle.style.visibility = "visible";
				resEle.innerHTML = "There was an error!";
				if (updating == 1) {updating = 0;}
				if (posting == 1) {posting = 0;}
			}
		resize();
		}
	}
	var url = "pinboard.php" + "?q=" + escape(str) + "&w=" + escape(str2) + "&t=" + type + "&ut=" + unixTime;
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
	resEle.innerHTML = "<img src='" + wait_image.src + "' alt='wait' />" + waitmsg;
}

eventHook(window, "load", pbInit);