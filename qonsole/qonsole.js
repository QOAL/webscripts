/*
    Qonsole - A Quake like console for webpages
    Copyright (C) 2009 Scott Ellis

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

//From http://www.somacon.com/p355.php
//Assuming this function is in the 'public domain'.
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

var maxLines = 20; //Maximum number of lines in to show in the qonsole
var consolefocused = false;
var consolehidden = true;
var slidetimer = 0;
var sliding = false;
var slidedir = false;
var inputhistory = [];
var historypos = 0;
var oldhash = "";

function eventHook(ele, event, func) {
	if (document.all) {
		ele.attachEvent("on" + event, func);
	} else {
		ele.addEventListener(event, func, false);
	}
}

function fireconsole(evt) {
	qInput = document.getElementById("qinput");
	try {
		var key = window.event.keyCode;
		var shift = window.event.shiftKey;
	} catch(ex){
		var key = evt.which;
		var shift = evt.shiftKey;
	}
	if ((key == 96 || key == 126 || key == 189) && !shift) { //96 = ` (uk),  126 = ~ (usa?), 189 = 1/2, for DK people ;)
		if (consolefocused == true) {
			if (document.all) {
				window.event.returnValue = null;
			} else {
				evt.preventDefault();
			}
		}
		if (sliding == false) {
			if (consolehidden == true) {
				document.getElementById("qframe").style.visibility = "visible";
				slidedir = false;
				slidetimer = setInterval("slide(" + slidedir + ")", 10);
				qInput.focus();
				sliding = true;
			} else {
				slidedir = true;
				slidetimer = setInterval("slide(" + slidedir + ")", 10);
				qInput.blur();
				sliding = true;
			}
			consolehidden = !consolehidden;
		} else {
			clearInterval(slidetimer);
			slidedir = !slidedir;
			if (slidedir == true) {
				qInput.blur();
			} else {
				qInput.focus();
			}
			slidetimer = setInterval("slide(" + slidedir + ")", 10);
			consolehidden = !consolehidden;
		}
	}
	if (key == 13 && consolefocused == true) { //enter
		qInput.value = qInput.value.trim();
		if (qInput.value != "") {
			//Do processing of input, using via ajax where needed
			qin = document.getElementById("qinput").value;
			historypos = inputhistory.push(qin);
			toQonsole("<b>></b> <em>" + htmlspecialchars(qin) + "</em>");
			qInput.value = "";
			parseInput(qin);
			qInput.focus(); //keep the focus
		}
	}
	if (key == 38 && !shift && consolefocused == true && inputhistory.length > 0) { //up
		historypos--;
		if (historypos < 0) { historypos = 0; }
		qInput.value = inputhistory[historypos];
	}
	if (key == 40 && !shift && consolefocused == true && inputhistory.length > 0) { //down
		historypos++;
		if (historypos > inputhistory.length - 1) { historypos = inputhistory.length - 1; }
		qInput.value = inputhistory[historypos];
	}
}

function parseInput(qin) {

	if (qin.substr(0,11) == "javascript:" || qin.substr(0,3) == "js:") {
		if (qin.substr(0,3) == "js:") { pos = 3; } else { pos = 11; }
		toQonsole("Parsing javascript input... ");
		if (qin.substr(qin.length - 1, 1) != ";") {
			qin += ";"; //lame attempt at stopping script errors breaking proceedings 
		}
		try {
			eval(qin.substr(pos));
			toQonsole("Complete!");
		} catch(err) {
			toQonsole("An error occoured!<br />The error was: " + err.name + ", " + err.message + ".");
		}
		return;
	}

	var cmd = qin.toLowerCase();
	var args = "";
	if (cmd.indexOf(" ") != -1) {
		cmd = cmd.substr(0, cmd.indexOf(" "));
		args = qin.substr(qin.indexOf(" ") + 1);
	}

	switch(cmd) {
		case "hide":
			if (consolehidden == false) {
				slidedir = true;
				args = args.toLowerCase().trim();
				if (args == "fast" || args == "-f" || args == "now") {
					if (sliding) { clearInterval(slidetimer); }
					sliding = false;
					document.getElementById("qframe").style.visibility = "hidden";
					document.getElementById("qframe").style.top = -250 - 10 + "px";
				} else if (sliding == false) {
					slidetimer = setInterval("slide(" + slidedir + ")", 10);
					sliding = true;
				}
				consolehidden = true;
				document.getElementById("qinput").blur();
			}
			break;

		case "show":
			if (consolehidden == true) {
				slidedir = false;
				document.getElementById("qframe").style.visibility = "visible";
				args = args.toLowerCase().trim();
				if (args == "fast" || args == "-f" || args == "now") {
					if (sliding) { clearInterval(slidetimer); }
					sliding = false;
					document.getElementById("qframe").style.top = 0 + "px";
				} else if (sliding == false) {
					sliding = true;
					slidetimer = setInterval("slide(" + slidedir + ")", 10);
				}
				consolehidden = false;
				document.getElementById("qinput").focus();
			}
			break;

		case "clear":
		case "cls":
			document.getElementById("qonsole").innerHTML = "";
			break;

		case "echo":
		case "print":
		case "say":
			toQonsole(htmlspecialchars(args));
			break;

		case "url":
		case "uri":
		case "site":
		case ">":
			window.location.href = args; //HRM...
			break;

		default:
			//Send the command via AJAX to the php for parsing.
			qajax(qin);
	}
}

function slide(dir) {
	//true = up, false = down
	qFrame = document.getElementById("qframe");
	if (dir == true) {
		qFrame.style.top = qFrame.offsetTop - 10 + "px";
		if (qFrame.offsetTop <= -250 - 10) {
			qFrame.style.top = -250 - 10 + "px";
			qFrame.style.visibility = "hidden";
			sliding = false;
			clearInterval(slidetimer);
		}
	} else {
		qFrame.style.top = qFrame.offsetTop + 10 + "px";
		if (qFrame.offsetTop >= 0) {
			qFrame.style.top = 0 + "px";
			sliding = false;
			clearInterval(slidetimer);
		}
	}
}

function toQonsole(str) {
	if (document.getElementById("qonsole").innerHTML.split("<br").length > maxLines - 1) {
		qText = document.getElementById("qonsole").innerHTML;
		removeNum = qText.split("<br").length - maxLines;
		for (i = 0; i <= removeNum; i++) {
			qText = qText.substr(qText.search("<br") + 4);
		}
		document.getElementById("qonsole").innerHTML = qText;
	}
	document.getElementById("qonsole").innerHTML += "<br />" + str;
}
function toq(str) {
	toQonsole(str);
}

function htmlspecialchars(str) {
	str = str.replace(/&/g, '&amp;');
	str = str.replace(/"/g, '&quot;');
	str = str.replace(/'/g, '&#039;');
	str = str.replace(/</g, '&lt;');
	str = str.replace(/>/g, '&gt;');
	return str;
}


function resizeinput() {
	document.getElementById("qinput").style.width = document.documentElement.clientWidth - 20 + "px";
}

function anchorCheck() {
	if (location.hash != oldhash) {
		oldhash = location.hash;
		if (oldhash.substr(0,3) == "#q:") {
			location.hash = "";
			toQonsole("<b>#</b> <em>" + htmlspecialchars(oldhash.substr(3).trim()) + "</em>");
			parseInput(oldhash.substr(3).trim());
		}
	}
}

function qonsoleInit() {
	newWin = document.createElement('div');
	newWin.id = 'qframe';
	newWin.innerHTML = '<div id="qonsole" class="qonsole"><big><b>Qonsole</b></big><br />&bull; Need <a href="#q:help">help</a>?<br /></div>' +
		'<div class="qinput"><b>&raquo;</b> <input type="text" id="qinput"></div>';
	document.body.insertBefore(newWin, null);

	resizeinput();
	if ("onhashchange" in window) {
		window.onhashchange = anchorCheck;
	} else {
		setInterval(anchorCheck, 500);
	}
	eventHook(document, "keypress", fireconsole);
	eventHook(window, "resize", resizeinput);
	eventHook(document.getElementById("qframe"), "click", function() { document.getElementById('qinput').focus(); });
	eventHook(document.getElementById("qinput"), "focus", function() { consolefocused = true; });
	eventHook(document.getElementById("qinput"), "blur", function() { consolefocused = false; });
	eventHook(document.getElementById("qinput"), "keydown", fireconsole);
}

function qajax(str) {
	var xmlHttp;
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
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
		if (xmlHttp.readyState==4) {
			if (xmlHttp.status == 200) {
				var qresponse = xmlHttp.responseText;
				if (qresponse.substr(qresponse.length - 1,1) != ";") {
					qresponse += ";"; //lame attempt at stopping script errors breaking proceedings 
				}
				try {
					eval(qresponse);
				} catch(err) {
					toQonsole("An error occoured!<br />The error was: " + err.name + ", " + err.message + ".");
				}
			} else {
				toQonsole("Oops! An error occoured: HTTP " + xmlHttp.status + " " + xmlHttp.statusText + ".");
			}
			document.getElementById("qinput").disabled = false;
			document.getElementById('qinput').focus();
		}
	}
	var url = "qonsole.php";
	str = "qin=" + encodeURIComponent(str); //prepare the str
	xmlHttp.open("POST", url, true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.setRequestHeader("Content-length", str.length);
	xmlHttp.setRequestHeader("Connection", "close");
	xmlHttp.send(str);
	//document.getElementById(resid).innerHTML = "<img src='" + wait_image.src + "' alt='wait' />" + waitmsg;
	document.getElementById("qinput").disabled = true;
}

eventHook(window, "load", qonsoleInit);