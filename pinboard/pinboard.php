<?php
/*
    Pinboard - a AJAX pin board
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

//This was inspired by the now defunct http://www.nowasciana.pl/

date_default_timezone_set('Europe/London');

$PB_FILE = "pb.txt";
$IMGS_PATH = "images/";
$BOARD_SIZE_X = 5000;
$BOARD_SIZE_Y = 5000;

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
	<link rel="stylesheet" type="text/css" href="pb.css" />
	<title>Pinboard</title>
	<script type="text/javascript">
	//<![CDATA[
	var wait_image = document.createElement(\'img\');
	wait_image.src = "' . $IMGS_PATH . 'wait.gif";
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
<div class="pbm" style="left:5px;top:5px;background:' . random_hex_colour() . ';">Click anywhere to add a message!</div>
<div id="pb" style="position:absolute;visibility:hidden;">
	<form enctype="multipart/form-data" action="pinboard.php" method="post">
		<textarea class="tastyle" name="msg" id="msg" rows="1" cols="5"></textarea>
		<div id="status" class="status"></div>
		<div style="position:absolute;left:0px;top:-20px;">
			<input type="button" onclick="postmsg();" name="ok" value="Okay!" />
		</div>
	</form>
</div>
<div id="loading" class="pbm" style="left:5px;top:29px;background:' . random_hex_colour() . ';visibility:hidden;"></div>
</body></html>';

/*
Functions
*/
//From http://uk2.php.net/manual/en/function.urldecode.php#79595
//Assuming this function is in the 'public domain'.
function utf8_urldecode($str) {
	$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($str));
	return html_entity_decode($str, null, 'UTF-8');;
}

//Okay these encoding functions may seem like a lot of code, however they're only called when something is written to the $PB_FILE
//http://www.php.net/manual/en/function.mb-check-encoding.php#95289
function check_utf8($str) {
	$len = strlen($str);
	for($i = 0; $i < $len; $i++){
		$c = ord($str[$i]);
		if ($c > 128) {
			if (($c > 247)) return false;
			elseif ($c > 239) $bytes = 4;
			elseif ($c > 223) $bytes = 3;
			elseif ($c > 191) $bytes = 2;
			else return false;
			if (($i + $bytes) > $len) return false;
			while ($bytes > 1) {
				$i++;
				$b = ord($str[$i]);
				if ($b < 128 || $b > 191) return false;
				$bytes--;
			}
		}
	}
	return true;
} // end of check_utf8 

//This set of code fixes latin chars mixed in to unicode so it all works properly!
//http://www.php.net/manual/en/function.utf8-encode.php#93162 && http://www.php.net/manual/en/function.utf8-encode.php#95477
function init_byte_map(){
	global $byte_map;
	for($x=128;$x<256;++$x){
		$byte_map[chr($x)]=utf8_encode(chr($x));
	}
	$cp1252_map=array(
		"\x80"=>"\xE2\x82\xAC",    // EURO SIGN
		"\x82" => "\xE2\x80\x9A",  // SINGLE LOW-9 QUOTATION MARK
		"\x83" => "\xC6\x92",      // LATIN SMALL LETTER F WITH HOOK
		"\x84" => "\xE2\x80\x9E",  // DOUBLE LOW-9 QUOTATION MARK
		"\x85" => "\xE2\x80\xA6",  // HORIZONTAL ELLIPSIS
		"\x86" => "\xE2\x80\xA0",  // DAGGER
		"\x87" => "\xE2\x80\xA1",  // DOUBLE DAGGER
		"\x88" => "\xCB\x86",      // MODIFIER LETTER CIRCUMFLEX ACCENT
		"\x89" => "\xE2\x80\xB0",  // PER MILLE SIGN
		"\x8A" => "\xC5\xA0",      // LATIN CAPITAL LETTER S WITH CARON
		"\x8B" => "\xE2\x80\xB9",  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
		"\x8C" => "\xC5\x92",      // LATIN CAPITAL LIGATURE OE
		"\x8E" => "\xC5\xBD",      // LATIN CAPITAL LETTER Z WITH CARON
		"\x91" => "\xE2\x80\x98",  // LEFT SINGLE QUOTATION MARK
		"\x92" => "\xE2\x80\x99",  // RIGHT SINGLE QUOTATION MARK
		"\x93" => "\xE2\x80\x9C",  // LEFT DOUBLE QUOTATION MARK
		"\x94" => "\xE2\x80\x9D",  // RIGHT DOUBLE QUOTATION MARK
		"\x95" => "\xE2\x80\xA2",  // BULLET
		"\x96" => "\xE2\x80\x93",  // EN DASH
		"\x97" => "\xE2\x80\x94",  // EM DASH
		"\x98" => "\xCB\x9C",      // SMALL TILDE
		"\x99" => "\xE2\x84\xA2",  // TRADE MARK SIGN
		"\x9A" => "\xC5\xA1",      // LATIN SMALL LETTER S WITH CARON
		"\x9B" => "\xE2\x80\xBA",  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
		"\x9C" => "\xC5\x93",      // LATIN SMALL LIGATURE OE
		"\x9E" => "\xC5\xBE",      // LATIN SMALL LETTER Z WITH CARON
		"\x9F" => "\xC5\xB8"       // LATIN CAPITAL LETTER Y WITH DIAERESIS
	);
	foreach($cp1252_map as $k=>$v){
		$byte_map[$k]=$v;
	}
}

function fix_latin($instr){
	//if(mb_check_encoding($instr,'UTF-8'))return $instr; // no need for the rest if it's all valid UTF-8 already
	if(check_utf8($instr))return $instr; // no need for the rest if it's all valid UTF-8 already
	
	$ascii_char='[\x00-\x7F]';
	$cont_byte='[\x80-\xBF]';
	$utf8_2='[\xC0-\xDF]'.$cont_byte;
	$utf8_3='[\xE0-\xEF]'.$cont_byte.'{2}';
	$utf8_4='[\xF0-\xF7]'.$cont_byte.'{3}';
	$utf8_5='[\xF8-\xFB]'.$cont_byte.'{4}';
	$nibble_good_chars = "@^($ascii_char+|$utf8_2|$utf8_3|$utf8_4|$utf8_5)(.*)$@s";

	global $byte_map;
	$outstr='';
	$char='';
	$rest='';
	while((strlen($instr))>0){
		if(1==preg_match($nibble_good_chars,$instr,$match)){
			$char=$match[1];
			$rest=$match[2];
			$outstr.=$char;
		}elseif(1==preg_match('@^(.)(.*)$@s',$instr,$match)){
			$char=$match[1];
			$rest=$match[2];
			$outstr.=$byte_map[$char];
		}
		$instr=$rest;
	}
	return $outstr;
}

function writestringtofile($filename,$filestring) {
	$byte_map=array();
	init_byte_map();
	$handle	= fopen($filename, 'a');
	fwrite($handle, fix_latin($filestring) . "\n");
	fclose($handle);
}

//To save bandwidth you could use 3 digit hex values, update the JS version too for consistory.
function random_hex_colour() {
	return '#' . sprintf("%02X%02X%02X", mt_rand(96, 255), mt_rand(96, 255), mt_rand(96, 255));
}

//Even though we don't allow people to post links, it's nice to let an admin post them.
//Also very easy to add extra bbcode here, but it's not a good idea due to attention whores/kids/spammers.
function bbcode_format($str) {
	$str = bbcode_smilies($str);
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
		'<span style="text-decoration: underline">$1</span>',
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
	$smilesIn = array('/:\)/i', '/:D/i', '/;\)/i', '/:\|/i', '/:\(/i', "/:&#039;\(/i", '/&gt;:\[/i',
		'/:P/i', '/:O/i', '/&lt;_&lt;/i', '/&gt;_&gt;/i', '/:S/i', '/\B:\//i', '/\B:\\\/i',
	);
	$smilesOut = array(
		'<img src="' . $IMGS_PATH . 'happy.gif" alt=":)" />',
		'<img src="' . $IMGS_PATH . 'veryhappy.gif" alt=":D" />',
		'<img src="' . $IMGS_PATH . 'wink.gif" alt=";)" />',
		'<img src="' . $IMGS_PATH . 'blank.gif" alt=":|" />',
		'<img src="' . $IMGS_PATH . 'sad.gif" alt=":(" />',
		'<img src="' . $IMGS_PATH . 'crying.gif" alt=":\'(" />',
		'<img src="' . $IMGS_PATH . 'mad.gif" alt=">:[" />',
		'<img src="' . $IMGS_PATH . 'tounge.gif" alt=":P" />',
		'<img src="' . $IMGS_PATH . 'shock.gif" alt=":O" />',
		'<img src="' . $IMGS_PATH . 'paranoid.gif" alt="<_<" />',
		'<img src="' . $IMGS_PATH . 'paranoid2.gif" alt=">_>" />',
		'<img src="' . $IMGS_PATH . 'confused.gif" alt=":S" />',
		'<img src="' . $IMGS_PATH . 'indifferent.gif" alt=":/" />',
		'<img src="' . $IMGS_PATH . 'indifferent2.gif" alt=":\" />',
	);
	$str = preg_replace($smilesIn, $smilesOut, $str);
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
function getNewMSGs($oldtime) {
	global $PB_FILE;
	$output = '';
	if (file_exists($PB_FILE)) {
		$pblist = file($PB_FILE);
		foreach ($pblist as $ul) {
			$ul = bbcode_format(htmlentities(trim($ul), ENT_QUOTES, "UTF-8")); $tul = '';
			$time2 = substr($ul, 0, strpos($ul, chr(6)));
			if ($time2 > $oldtime) {
				$tul = substr($ul,strpos($ul,chr(6)));
				$tul = str_replace(chr(6) . '1' . chr(7),'	<div class="pbm" style="' . ($oldtime > 0 ? 'display:none;' : '') . 'left:',$tul);
				$tul = str_replace(chr(6) . '2' . chr(7),'px;background:' . random_hex_colour() . ';">',$tul);
				$tul = str_replace(chr(6) . '3' . chr(7),'</div>' . "\n",$tul);
				$tul = str_replace(chr(6) . chr(6) . chr(6),'<br />',$tul);
				$output .= $tul;
			}
		}
	}
	return $output;
}
?>