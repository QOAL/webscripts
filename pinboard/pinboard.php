<?php
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

//This was inspired by the now defunct http://www.nowasciana.pl/

date_default_timezone_set('GMT');

$PB_FILE = "pb.txt";
$IMGS_PATH = "images/";
$BOARD_SIZE_X = 2000;
$BOARD_SIZE_Y = 2000;

/*
AJAX
*/
if (get_magic_quotes_gpc()) {
    function stripslashes_deep($value)
    {
        $value = is_array($value) ?
                    array_map('stripslashes_deep', $value) :
                    stripslashes($value);

        return $value;
    }

    $_POST = array_map('stripslashes_deep', $_POST);
    $_GET = array_map('stripslashes_deep', $_GET);
}

if($_GET['t']) {
	$type = $_GET['t'];
} else {
	$type = "";
}

if ($type) {
	if($_GET['q']) {
		$input = utf8_urldecode($_GET['q']);
	} else {
		$input = "";
	}
	if($_GET['w']) {
		$input2 = utf8_urldecode($_GET['w']);
	} else {
		$input2 = "";
	}
	if($_GET['ut']) {
		$ut = $_GET['ut'];
	} else {
		$ut = time();
	}
	$time=trim(stripbad($ut));
	if ($time > time()) { $time = time(); }
	
	switch ($type) {

		case 'pbpost':
			$msg=trim(stripbad($input));
			$xy=strip_tags(trim(stripbad($input2)));
			
			$msg = str_replace(chr(10),chr(6) . chr(6) . chr(6),$msg);
			$msg = str_replace(chr(13),'',$msg);

			$pos = explode(",",$xy);
			if ($msg != "") {
				if ($pos[0] < 0 || $pos[1] < 0 || $pos[0] > $BOARD_SIZE_X || $pos[1] > $BOARD_SIZE_Y) {
					echo 'PPosition out of bounds.';
				} else {
					if(preg_match("/(\burl\b|http|\bwww\.|\.(com|us|net|biz|info|org|ru|su)\b)/i",$msg)) {
						echo 'PNo URLs punk.';
					} else {
						writestringtofile($PB_FILE,time() . chr(6).'1'.chr(7).$pos[0].'px;top:'.$pos[1].chr(6).'2'.chr(7).$msg.chr(6).'3'.chr(7));
						echo 'PP' . time() . 'T' . getNewMSGs($time);
					}
				}
			} else {
				echo 'PNo message to post. :(';
			}
			break;

		case 'pblist':
			echo 'L' . time() . 'T' . getNewMSGs($time);
			break;
		
		default:
			header("HTTP/1.0 400 Bad Request");
			break;
	}
	exit();
}

/*
Main page
*/
header("Content-Type: text/html; charset=utf-8");
Echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
	<link rel="stylesheet" title="default" type="text/css" href="pb.css" />
	<title>Pin board</title>
	<script type="text/javascript">
	//<![CDATA[
	if (document.images) {
		wait_image = new Image(10,10); 
		wait_image.src="' . $IMGS_PATH . 'wait.gif"; 
	}
	var unixTime = "' . time() . '";
	var boardSizeX ="' . $BOARD_SIZE_X . '";
	var boardSizeY ="' . $BOARD_SIZE_Y . '";
	//]]>
	</script>
	<script type="text/javascript" src="pb.js"></script>
</head>
<body>
<div id="msgs">
' . getNewMSGs(0) . '</div>
<div class="pbm" style="left:5px;top:5px;background:#' . random_hex_color() . ';">Click anywhere to add a message!</div>
<div id="pb" style="position:absolute;visibility:hidden;">
	<form enctype="multipart/form-data" action="pinboard.php" method="post">
		<textarea class="tastyle" name="msg" id="msg" rows="1" cols="5"></textarea>
		<div id="status" class="status"></div>
		<div style="position:absolute;left:0px;top:-20px;">
			<input type="button" onclick="postmsg();" name="ok" value="Okay!" />
		</div>
	</form>
</div>
<div id="loading" class="pbm" style="left:5px;top:29px;background:#' . random_hex_color() . ';visibility:hidden;"></div>
</body></html>';

/*
Functions
*/
function writestringtofile($filename,$filestring) {
	$handle	= fopen($filename, 'a');
	fwrite($handle, utf8_encode($filestring . "\n"));
	fclose($handle);
}

//To save bandwidth you could use 3 digit hex values, update the JS version too for consistory.
function random_hex_color() {
	return sprintf("%02X%02X%02X", mt_rand(96, 255), mt_rand(96, 255), mt_rand(96, 255));
}

//Even though we don't allow people to post links, it's nice to let an admin post them.
//Also very easy to add extra bbcode here, but it's not a good idea due to attention whores/kids/spammers.
function bbcode_format($str) {
	$str = bbcode_smilies ($str);
	$input = array(
		'/\[b\](.*?)\[\/b\]/is',
		'/\[i\](.*?)\[\/i\]/is',
		'/\[u\](.*?)\[\/u\]/is',
		'/\[s\](.*?)\[\/s\]/is',
		'/\[url\=(.*?)\](.*?)\[\/url\]/is',
		'/\[url\](.*?)\[\/url\]/is',
		);
	$output = array(
		'<strong>$1</strong>',
		'<em>$1</em>',
		'<u>$1</u>',
		'<del>$1</del>',
		'<a href="$1" target="_blank">$2</a>',
		'<a href="$1" target="_blank">$1</a>',
		);
	$str = preg_replace($input, $output, $str);
	return $str;
}

//This function needs fixing up/improving!
function bbcode_smilies($str) {
	global $IMGS_PATH;
	$input = array(':)', ':D', ';)', ':|', ':(', ":'(", '&gt;:[', ':p', ':P', ':o',
		':O', '&lt;_&lt;', '&gt;_&gt;', ':s', ':S', ' :/', ":\\");
	$output = array(
		'<img src="' . $IMGS_PATH . 'happy.gif" alt=":)" />',
		'<img src="' . $IMGS_PATH . 'veryhappy.gif" alt=":D" />',
		'<img src="' . $IMGS_PATH . 'wink.gif" alt=";)" />',
		'<img src="' . $IMGS_PATH . 'blank.gif" alt=":|" />',
		'<img src="' . $IMGS_PATH . 'sad.gif" alt=":(" />',
		'<img src="' . $IMGS_PATH . 'crying.gif" alt=":\'(" />',
		'<img src="' . $IMGS_PATH . 'mad.gif" alt="&gt;:[" />',
		'<img src="' . $IMGS_PATH . 'tounge.gif" alt=":p" />',
		'<img src="' . $IMGS_PATH . 'tounge.gif" alt=":P" />',
		'<img src="' . $IMGS_PATH . 'shock.gif" alt=":o" />',
		'<img src="' . $IMGS_PATH . 'shock.gif" alt=":O" />',
		'<img src="' . $IMGS_PATH . 'paranoid.gif" alt="&lt;_&lt;" />',
		'<img src="' . $IMGS_PATH . 'paranoid2.gif" alt="&gt;_&gt;" />',
		'<img src="' . $IMGS_PATH . 'confused.gif" alt=":s" />',
		'<img src="' . $IMGS_PATH . 'confused.gif" alt=":S" />',
		' <img src="' . $IMGS_PATH . 'indifferent.gif" alt=":/" />',
		'<img src="' . $IMGS_PATH . 'indifferent2.gif" alt=":\" />');
	$str = str_replace($input, $output, $str);
	return $str;
}

//Modified version of http://uk2.php.net/manual/en/function.chr.php#70931
//Assuming this function is in the 'public domain'.
function stripbad($string) {
	for ($i=0;$i<strlen($string);$i++) {
		$chr = $string{$i};
		$ord = ord($chr);
		if ($ord <= 9 || $ord == 11 || $ord == 12 || ($ord >= 14 && $ord <= 31) || $ord == 127) {
			$string{$i} = null;
		}
	}
	return str_replace("\0","",$string);
}

//From http://uk2.php.net/manual/en/function.urldecode.php#79595
//Assuming this function is in the 'public domain'.
function utf8_urldecode($str) {
	$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($str));
	return html_entity_decode($str, null, 'UTF-8');;
}

//Dunno if this can be made more efficient
function getNewMSGs($oldtime) {
	global $PB_FILE;
	$output = '';
	if (file_exists($PB_FILE)) {
		$pblist = file($PB_FILE);
		foreach ($pblist as $ul) {
			$ul = bbcode_format(htmlentities(trim($ul), ENT_COMPAT, "UTF-8")); $tul = '';
			$time2 = substr($ul, 0, strpos($ul, chr(6)));
			if ($time2 > $oldtime) {
				$tul = substr($ul,strpos($ul,chr(6)));
				$tul = str_replace(chr(6) . '1' . chr(7),'	<div class="pbm" style="left:',$tul);
				$tul = str_replace(chr(6) . '2' . chr(7),'px;background:#' . random_hex_color() . ';">',$tul);
				$tul = str_replace(chr(6) . '3' . chr(7),'</div>' . "\n",$tul);
				$tul = str_replace(chr(6) . chr(6) . chr(6),'<br />',$tul);
				$output .= $tul;
			}
		}
	}
	return $output;
}
?>