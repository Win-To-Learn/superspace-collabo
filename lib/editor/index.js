(function($){

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

})(jQuery);