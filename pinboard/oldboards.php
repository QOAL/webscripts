<?php
/*
    Pinboard - a AJAX pin board
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

$PB_PATH = 'pb/';

if (isset($_GET['v'])) {
	if (file_exists($PB_PATH . $_GET['v'] . '.txt'))
	{
		$PB_FILE = $PB_PATH . $_GET['v'] . '.txt';
	}
}

/*
Main page
*/
header("Content-Type: text/html; charset=utf-8");
echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
	<link rel="stylesheet" title="default" type="text/css" href="pb.css" />
	<title>Pinboard</title>
	<script type="text/javascript" src="oldpb.js"></script>
</head>
<body>
<div id="msgs">
' . getMSGs() . '</div>
</body></html>';

/*
Functions
*/

//To save bandwidth you could use 3 digit hex values, update the JS version too for consistory.
function random_hex_colour() {
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

//Dunno if this can be made more efficient
function getMSGs() {
	global $PB_FILE;
	$output = '';
	if (file_exists($PB_FILE)) {
		$pblist = file($PB_FILE);
		foreach ($pblist as $ul) {
			$ul = bbcode_format(htmlentities(trim($ul), ENT_COMPAT, "UTF-8")); $tul = '';
			$tul = substr($ul,strpos($ul,chr(6)));
			$tul = str_replace(chr(6) . '1' . chr(7),'	<div class="pbm" style="left:',$tul);
			$tul = str_replace(chr(6) . '2' . chr(7),'px;background:#' . random_hex_colour() . ';">',$tul);
			$tul = str_replace(chr(6) . '3' . chr(7),'</div>' . "\n",$tul);
			$tul = str_replace(chr(6) . chr(6) . chr(6),'<br />',$tul);
			$output .= $tul;
		}
	}
	return $output;
}
?>