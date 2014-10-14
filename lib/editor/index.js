
// Initialize editor on #editor div
var editor = ace.edit("editor");
var session = editor.getSession();
editor.setTheme("ace/theme/monokai");
session.setMode("ace/mode/javascript");

var tabOpen = false;
var editorHeight = 430;
var $codeArea = $('#codeArea');
var $editorTab = $('#editorTab');
var $submitCode = $('#submitCode');
var $loadCustom = $('#loadCustom');
var $saveCustom = $('#saveCustom');

$editorTab.click(function(){
	tabOpen ? closeTab() : openTab();
	tabOpen = !tabOpen;
	$codeArea.toggleClass('open', tabOpen);
});

$submitCode.click(function(){
	var code = session.getValue();
	ige.network.send('code', code);
});

function closeTab() {
	$codeArea.stop().animate({
		bottom: -editorHeight
	});
}

function openTab() {
	$codeArea.stop().animate({
		bottom: 0
	});
}

/* ------------------------------------------- *\
			Local storage save stuff
\* ------------------------------------------- */

if(typeof(Storage) !== "undefined" && localStorage.getItem("code") !== null && localStorage.getItem("code") !== "") {
	editor.setValue(localStorage.getItem("code"));
}

$loadCustom.click(function() {
	if(typeof(Storage) !== "undefined") {
		editor.setValue(localStorage.getItem("code"));
	}
});

$saveCustom.click(function() {
	if(typeof(Storage) !== "undefined") {
		localStorage.setItem("code", editor.getValue());
	}
});

/* ------------------------------------------- *\
				Lesson list
\* ------------------------------------------- */

$('#lessonList').on('click', '.lessonButton', function() {
	$(".lessonButton").removeAttr("data-active");
	$(this).attr("data-active", "true");
	console.log(lessons);
	if(lessons[$(this).attr("data-lesson")] !== undefined) {
		session.setValue(lessons[$(this).attr("data-lesson")]);
	}
});

/* ------------------------------------------- *\
				Debug container
\* ------------------------------------------- */

var debugContainer = $("#debugContainer");
var debug = ace.edit("debug");
var debugSession = debug.getSession();
var $hideDebug = $('#hideDebug');
debug.setTheme("ace/theme/monokai");
debug.clearSelection();
debug.renderer.setShowGutter(false);
debugSession.setMode("ace/mode/javascript");

$hideDebug.click(function() {
	debugContainer.fadeOut(200);
});

