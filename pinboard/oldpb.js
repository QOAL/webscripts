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

function eventHook(ele, event, func) {
	if (document.all) {
		ele.attachEvent("on" + event, func);
	} else {
		ele.addEventListener(event, func, false);
	}
}

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

function pbInit() {
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

eventHook(window, "load", pbInit);