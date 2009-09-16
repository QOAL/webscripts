/*
    Pin board - a AJAX pin board
    Copyright (C) 2008-2009 Scott Ellis

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
	mouseX = evt.pageX?evt.pageX:evt.clientX;
	mouseY = evt.pageY?evt.pageY:evt.clientY;
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
	if (mouseX < 0 | mouseY < 0 | mouseX > boardSizeX | mouseY > boardSizeY) {
		document.getElementById("status").innerHTML = "Position out of bounds.";
	} else {
		if (document.getElementById("msg").value.trim() != "") {
			if (updating == 0 && posting == 0) {
				ajaxFunction(document.getElementById("msg").value,MXY,"pbpost","status"," Posting...");
				posting = 1;
			} else {
				document.getElementById("status").innerHTML = "Wait a sec; updating...";
			}
		} else {
			document.getElementById("status").innerHTML = "No message to post. :(";
		}
	}
	document.getElementById("status").style.visibility = "visible";
	document.getElementById("status").style.width = document.getElementById("status").innerHTML.getWidth(rStyle) + "px";
}

//From http://twelvestone.com/forum_thread/view/32353
//Assuming this function is in the 'public domain'.

//Needed for the text areas style when getting width. Work around? :S
rStyle = {};
rStyle.fontSize = "12px";
rStyle.fontFamily = "verdana, arial, helvetica, sans-serif";
rStyle.padding = "5px";

String.prototype.getWidth = function(styleObject){
	var test = document.createElement("span");
	document.body.appendChild(test);
	test.style.visibility = "hidden";
	for(var i in styleObject){
		test.style[i] = styleObject[i];
	}
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
	document.getElementById("msg").style.width = longest.getWidth(rStyle) + "px";
}

function pbInit() {
	setInterval(reloadcheck, 10000);
	document.getElementById("msgs").style.width = boardSizeX + 'px';
	document.getElementById("msgs").style.height = boardSizeY + 'px';
	if (document.all)
	{
		document.attachEvent("onclick", update);
		document.getElementById("pb").attachEvent("onmouseover", function() { overandout = 1; });
		document.getElementById("pb").attachEvent("onmouseout", function() { overandout = 0; });
		document.getElementById("msg").attachEvent("onkeypress", resize);
		document.getElementById("msg").attachEvent("onkeyup", resize);
	} else {
		document.addEventListener("click", update, false);
		document.getElementById("pb").addEventListener("mouseover", function() { overandout = 1; }, false);
		document.getElementById("pb").addEventListener("mouseout", function() { overandout = 0; }, false);
		document.getElementById("msg").addEventListener("keypress", resize, false);
		document.getElementById("msg").addEventListener("keyup", resize, false);
	}
}

//The function could be made much nicer!
function ajaxFunction(str, str2, type, resid, waitmsg)
{
var xmlHttp;
try
  {
  // Firefox, Opera 8.0+, Safari
  xmlHttp=new XMLHttpRequest();
  }
catch (e)
  {
  // Internet Explorer
  try
    {
    xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
    }
  catch (e)
    {
    try
      {
      xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
      }
    catch (e)
      {
      alert("Your browser does not support AJAX!");
      return false;
      }
    }
  }
  xmlHttp.onreadystatechange=function()
    {
    if(xmlHttp.readyState==4)
      {
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
			document.getElementById(resid).innerHTML = "";
			document.getElementById(resid).style.visibility = "hidden";
		      } else {
			document.getElementById(resid).style.visibility = "visible";
			document.getElementById(resid).innerHTML = rstr;
			document.getElementById(resid).style.width = rstr.getWidth(rStyle) + "px";
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
		document.getElementById(resid).style.visibility = "hidden";
	      }
	      tick = 0;
	} else {
		document.getElementById(resid).style.visibility = "visible";
		document.getElementById(resid).innerHTML = "There was an error!";
		if (updating == 1) {updating = 0;}
		if (posting == 1) {posting = 0;}
	}
	resize();
      }
    }
  var url = "pinboard.php";
  url = url + "?q=" + escape(str) + "&w=" + escape(str2) + "&t=" + type + "&ut=" + unixTime;
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
  document.getElementById(resid).innerHTML = "<img src='" + wait_image.src + "' alt='wait' />" + waitmsg;
}

//onLoad = pbInit(); //fails for some reason so we need to call it from in the page