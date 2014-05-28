(function($){

  // Initialize editor on #editor div
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");

  var tabOpen = false;
  var editorHeight = 430;
  var $codeArea = $('#codeArea');
  var $editorTab = $('#editorTab');

  $editorTab.click(function(){
    tabOpen ? closeTab() : openTab();
    tabOpen = !tabOpen;
    $codeArea.toggleClass('open', tabOpen);
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