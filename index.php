<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="game-engine-origin" content="http://www.isogenicengine.com">
	<meta http-equiv="X-UA-Compatible" content="IE=9" >
	<title>SuperSpace</title>

	<!-- STYLES -->
	<link href="css/default.css" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" type="text/css" href="lib/editor/style.css">
	<!-- Isogenic Loader -->
	<script type="text/javascript">var igeRoot = 'engine/';</script>
	<script type="text/javascript" src="engine/loader.js"></script>
    <script type="text/javascript" src="howler.min.js"></script>
    <!-- <script src="https://togetherjs.com/togetherjs-min.js"></script> -->
	<script type="text/javascript">
<?php
	$lessonFiles = glob("lessons/*.txt");
	$lessonArray = Array();
	foreach($lessonFiles as $lessonFile) {
		$lines = file($lessonFile, FILE_IGNORE_NEW_LINES);
		if(count($lines) > 0) {
			$args = explode(";", $lines[0]);
			unset($lines[0]);
			$priority = 1000;
			if(isset($args[1])) {
				$priority = $args[1];
			}
			if(!isset($lessonArray[$priority])) { $lessonArray[$priority] = Array(); }
			$content = implode("\n", $lines);
			$hash = hash("crc32", $args[0].$priority);
			$lessonArray[$priority][$args[0]] = $hash;
			$lessonHashes[$hash] = $content;
		}
	}
	echo "var lessons = ".json_encode($lessonHashes).";";
?>
	</script>
</head>
<body>
<div id="login">
	<div class="loginTitle">Login / register</div>
	<div class="loginStatus"></div>
	<div class="loginField">Username: <input type="text" name="username" class="right"></div>
	<div class="loginField">Password: <input type="password" name="password" class="right"></div>
	<div class="loginField">Remember me <input type="checkbox" name="remember"><button name="submit" class="right">Login/register</button></div>
	
</div>
<!--audio id="Audio1" controls="controls" autoplay="autoplay" src="http://listen.ai-radio.org:8000/radio.ogg?cc=US&now=1411446531.126">
</audio-->

<!--<button onclick="TogetherJS(this); return false;" style="position:absolute;">Start TogetherJS</button>-->

<div id="chatBox">
	<div id="chatHistory"></div>
	<div id="chatInput">
		<input id="chatInputField" name="chatInputField" type="text">
		<input id="chatInputSubmit" name="chatInputSubmit" type="button" value="Send">
	</div>
</div>

<div id="codeArea">
	<div id="editorTab">code <span class='arrow'></span></div>
	<div id="lessonList">
<?php
	ksort($lessonArray, SORT_NATURAL);
	foreach($lessonArray as $level => $lessons) {
		ksort($lessons, SORT_NATURAL);
		foreach($lessons as $name => $hash) {
			echo "<div class='lessonButton' data-lesson='".$hash."'>".$name."</div>";
		}
	}
?>
	</div>
	<div id="editor">
    ////// THESE LESSONS ARE MORE FUN WITH A FRIEND   //////
    //////   EMAIL SOMEONE THE LINK TO THIS GAME      //////
    //////        SO YOU CAN PLAY TOGETHER!           //////
	</div>
	<div id="debugContainer">
		<div id="debug"></div>
		<button id="hideDebug">Hide output</button>
	</div>
	<div id="bottomBar">
		<button id="submitCode" class="submit">Submit Code</button>
		<button id="loadCustom">Load custom</button>
		<button id="saveCustom">Save custom</button>
	</div>
</div>

    <div class="igeLoading loadingFloat">
        <div class="loadingLogo"></div>
        <div class="loadingCircle"></div>
        <div class="loadingCircleInner"></div>
        <div class="loadingText" id="loadingText">
            Loading
        </div>
        <div id="loadingProgress">
            <div id="loadingProgressBar"></div>
        </div>
    </div>
    <div class="igeLoading loadingLink">

        <a href="http://www.wintolearn.com/contact.php" target="_blank">http://www.wintolearn.com</a>
    </div>
    <script src="lib/vendor/jquery-1.11.1.min.js" type="text/javascript"></script>
    <script src="lib/vendor/ace/ace.js" type="text/javascript" charset="utf-8"></script>
    <script src="lib/editor/index.js" type="text/javascript" charset="utf-8"></script>
<!-- index.js and ace.js and jquery are loaded -->
</body>
</html>