<?php
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

//Is my code tidy and easy to read + understand? (And all needed?)

date_default_timezone_set('Europe/London');
if (get_magic_quotes_gpc()) {
    function stripslashes_deep($value)
    {
        $value = is_array($value) ?
                    array_map('stripslashes_deep', $value) :
                    stripslashes($value);

        return $value;
    }

    $_POST = array_map('stripslashes_deep', $_POST);
}

if(isset($_POST['qin'])) {
	//From http://uk2.php.net/manual/en/function.urldecode.php#79595
	//Assuming this function is in the 'public domain'.
	function utf8_urldecode($str) {
		$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($str));
		return trim(html_entity_decode($str, null, 'UTF-8'));
	}
	$qin = utf8_urldecode($_POST['qin']);
}

if ($qin) {
	//find the first space and break that word off as the command, the rest is the thing to pass.
	if (strpos($qin, " ") != false) {
		$command = strtolower(substr($qin, 0, strpos($qin, " ")));
		$args = substr($qin, strpos($qin, " ") + 1);
		//Use $args = explode(" ", $args); to get this into an array.
	} else {
		$command = strtolower($qin);
	}
	
	switch ($command) {

		case 'help':
			echo 'toQonsole("Sorry, we\'re closed!");';
			break;

		case 'about':
			echo 'toQonsole("<big><b>Qonsole</b></big><br />By Scott Ellis AKA Quiche_on_a_leash / QOAL");';
			break;

		case 'hello':
		case 'hi':
		case 'hey':
			echo 'toQonsole("Hi!");';
			break;

		/*case 'echo':
		case 'print':
			echo 'toQonsole("' . addslashes(htmlspecialchars($args)) . '");';
			break;*/

		case 'time':
		case 'date':
			echo 'toQonsole("' . date("D jS M y, g:i a T",time()) . '");';
			break;

		case 'goto':
		case 'go':
			$ali = 0; //array last index - used so we know the last used one for the new path when it comes to passing stuff to the qonsole on page load
			$args = explode(" ", $args);
			if ($args[0] == "home") {
				$newpath = "index.php";
			}
			if ($args[0] == "forum" || $args[0] == "forums") {
				//Support for sub forums?
				$newpath = "index.php?v=forum";
			}
			if ($args[0] == "pinboard" || $args[0] == "pb") {
				$newpath = "pinboard.php";
			}
			if ($args[0] == "users" || $args[0] == "user") {
				//Support for user names ect?
				$newpath = "index.php?v=users";
			}
			if ($newpath != "") {
				//check $args[1] or the last one for show/hide and pass it? or just any last msg?
				$lastarg = $args[$ali+1];
				if ($lastarg) {
					for ($i = $ali + 2; $i < count($args); $i += 1) {
						$lastarg .= " " . $args[$i];
					}
					if ($lastarg == "show" || $lastarg == "1") {
						$lastarg = '#q:show -f';
					} else if ($lastarg == "hide" || $lastarg == "0") {
						$lastarg = '';
					} else {
						$lastarg = '#q:' . $lastarg;
					}
				}
				echo "var path = window.location.pathname; window.location.pathname = path.substring(0, path.lastIndexOf('/') + 1) + '$newpath$lastarg';";
			} else {
				//check if it's an url - if so go to it, else say you don't know where that is.
				echo 'toQonsole("I don\'t know where that is, sorry.");';
			}
			break;
		
		default:
			echo 'toQonsole("Unknown command: ' . $command . '")';
			break;
	}
	exit();
}

echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
	<title>Qonsole</title>
	<link rel="stylesheet" type="text/css" href="qonsole.css" />
	<script type="text/javascript" src="qonsole.js"></script>
</head>
<body onload="qonsoleInit();">
	<div id="qframe" class="qframe">
		<div id="qonsole" class="qonsole"><big><b>Qonsole</b></big><br />&bull; Need <a href="#q:help">help</a>?<br /></div>
		<div class="qinput"><b>&raquo;</b> <input type="text" id="qinput"></div>
	</div>
</body>
</html>'
//js:document.styleSheets[0]['cssRules'][0].style['padding'] = '25px';
//#q:go home js: location.hash = "#q:show -f"; alert("We made it home!\\nHooray for Qonsole :)");
?>