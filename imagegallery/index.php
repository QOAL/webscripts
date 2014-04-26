<?php
/*
    Image Gallery - A Simple lightweight photo gallery script
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


#### ### ## #
## You may wish to change these
#### ### ## #

# The name you wish to give the gallery
$GALLERY_NAME = 'Image Gallery';

# If you don't want a link going anywhere (like your index page)
# then set RETURN_LINK/RETURN_LINK_TEXT to = '';
$RETURN_LINK = '../index.php';
$RETURN_LINK_TEXT = 'Main site';

# Folder where the images are.
$IMAGE_FOLDER = './';

# Where to save the thumbnails.
$THUMBS_FOLDER = 'thumbnails/';

# Either png (Bigger but nicer image quality) or jpg (Smaller and fugly)
# If you change from one to the other then you'll need to manually delete the left over thumbnails.
$THUMB_FORMAT = 'jpg';

# Folder where you can place .txt files named the same
# as an image e.g. test.png.txt - the contents will be shown
# below the image (when view it)
$DESC_FOLDER = './';

# If you change the below update the sizes in the css file!
$thumbw=160; $thumbh=160;

# Change the time zone here!
date_default_timezone_set('GMT');

#### ### ## #
## End of config
#### ### ## #

if (isset($_GET['img']))
{
	$IMG = $_GET['img'];
	$ext=explode(".",strtolower($IMG));
	$imgs = array('jpg','jpeg','png','gif');
	if(!in_array($ext[1],$imgs) || !file_exists($IMAGE_FOLDER . $IMG))
	{
		$IMG = '';
	}
} else {
	$IMG = '';
}
if ($IMG != '')
{
	$menulink = ' &bull; <a href="index.php">Back to gallery</a>';
}

//Header
header("Content-Type: text/html; charset=utf-8");
echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<link rel="stylesheet" title="default" type="text/css" href="default.css" />
	<title>' . $GALLERY_NAME . '</title>
</head>
<body>
<div id="container">
	<div id="main">
		<b>' . $GALLERY_NAME . '</b>' . $menulink . ((!$RETURN_LINK || !$RETURN_LINK_TEXT) ? '' : ' &bull; <a href="' . $RETURN_LINK . '">' . $RETURN_LINK_TEXT . '</a>') . '<hr/>' . "\n";

//Page content
if($IMG != '')
{
	//Show the image on a page and grab a description if there is one
	$desc = '';
	if (file_exists($DESC_FOLDER . $IMG . ".txt"))
	{
		$infof = file($DESC_FOLDER . $IMG . ".txt");
		if($infof[0] != '')
		{
			$desc .= '<br /><br />';
		}
		foreach($infof as $info)
		{
			$desc .= trim($info) . "<br />";
		}
	}
	echo '		<p style="text-align: center;"><a href="index.php"><img class="fullview" src="' . $IMAGE_FOLDER . $IMG . '" alt="' . $IMG . '" title="' . $IMG . ' | Last modified on ' . date("F d Y H:i:s.", filemtime($IMAGE_FOLDER . $IMG)) . '"/></a><br /><b>' . $IMG . '</b>' . $desc . '</p>' . "\n";
} else {
	//Show the main gallery view
	
	if (file_exists($THUMBS_FOLDER) == False) {
	    mkdir($THUMBS_FOLDER);
	}
	
	$pics=directory($IMAGE_FOLDER,"jpg,jpeg,png,gif");
	if ($pics[0]!="")
	{
		$output = '';
		foreach ($pics as $p)
		{
			//Don't make the thumbnails again!!
			if (file_exists($THUMBS_FOLDER . "tn_" . $p. '.' . $THUMB_FORMAT) == false) {
				createthumb($IMAGE_FOLDER . $p, $THUMBS_FOLDER . "tn_" . $p . '.' . $THUMB_FORMAT, $thumbw, $thumbh);
			}
			$output .= '			<div class="frame"><div class="imgcont"><div class="img"><p class="img"><a href="index.php?img=' . $p . '"><img src="' . $THUMBS_FOLDER . 'tn_' . $p . '.' . $THUMB_FORMAT . '" alt="' . $p . '" title="' . $p . ' | Last modified on ' . date("F d Y H:i:s.", filemtime($IMAGE_FOLDER . $p)) . '"/></a></p></div></div><div class="caption"><a href="index.php?img=' . $p . '"><b>' . $p . '</b></a></div></div>' . "\n";
		}
		echo '		<table border="0" width="100%" cellspacing="0" align="center"><tr><td>' . "\n";
		echo $output;
		echo '		</td></tr></table>' . "\n";
	} else {
		echo '			No images to display<br/>This makes me sad :(' . "\n";
	}
	
	//kill unused thumbs
	$thumbs=directory($THUMBS_FOLDER,"jpg,jpeg,png,gif");
	foreach ($thumbs as $t)
	{
		$tp = substr($t, 3, -4);
		if(!in_array($tp,$pics))
		{
			unlink($THUMBS_FOLDER . $t);
		}
	}
}


echo'	</div>
</div>
</body></html>';

### ## #
## Functions
### ## #
function createthumb($name,$filename,$new_w,$new_h)
{
	global $THUMB_FORMAT;
	$system=explode(".",strtolower($name));
	if (preg_match("/jpg|jpeg/",$system[count($system)-1])){$src_img=imagecreatefromjpeg($name);}
	if (preg_match("/png/",$system[count($system)-1])){$src_img=imagecreatefrompng($name);}
	if (preg_match("/gif/",$system[count($system)-1])){$src_img=imagecreatefromgif($name);}
	if ($src_img == null) {return;}
	$old_x=imageSX($src_img);
	$old_y=imageSY($src_img);
	if ($old_x > $old_y) 
	{
		$thumb_w=$new_w;
		$thumb_h=round(($old_y/$old_x) * $new_w);
	}
	if ($old_x < $old_y) 
	{
		$thumb_w=round(($old_x/$old_y) * $new_h);
		$thumb_h=$new_h;
	}
	if ($old_x == $old_y) 
	{
		if ($new_w < $new_h) {
			$thumb_w=$new_w;
			$thumb_h=$new_w;
		} else {
			$thumb_w=$new_h;
			$thumb_h=$new_h;
		}
	}
	
	if ($old_x < $new_w && $old_y < $new_h)
	{
		/*$thumb_w=$old_x;
		$thumb_h=$old_y;*/
		//no point making a new file if it's going to be the same size,
		//and really... should point to the actual file... but lazy...
		//so lets copy the original file to the thumbs folder.
		//aka lazy hack.
		copy($name, $filename);
		return;
	}

	$dst_img=ImageCreateTrueColor($thumb_w,$thumb_h);
	imagealphablending($dst_img, false);
	imagesavealpha ($dst_img, true);
	$trans = imagecolorallocatealpha($dst_img,255,255,255,127);
	imagecolortransparent($dst_img, $trans);
	imagefill($dst_img,0,0,$trans);
	
	imagecopyresampled($dst_img,$src_img,0,0,0,0,$thumb_w,$thumb_h,$old_x,$old_y);
	switch ($THUMB_FORMAT) {
		case 'jpg':
			imagejpeg($dst_img,$filename,87.5);
			break;
		case 'png':
		default:
			imagepng($dst_img,$filename);
			break;
	}
	
	imagedestroy($dst_img);
	imagedestroy($src_img);
}

function directory($dir,$filters)
{
	$handle=opendir($dir);
	$files=array();
	if ($filters == "all"){while(($file = readdir($handle))!==false){$files[] = $file;}}
	if ($filters != "all")
	{
		$filters=explode(",",$filters);
		while (($file = readdir($handle))!==false)
		{
			for ($f=0;$f<sizeof($filters);$f++):
				$system=explode(".",strtolower($file));
				if (strtolower($system[count($system)-1]) == $filters[$f]){$files[] = $file;}
			endfor;
		}
	}
	closedir($handle);
	return $files;
}
?>
