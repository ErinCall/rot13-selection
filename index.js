/* jshint browser:true */
(function() {
  'use strict';

// TODO: IE8 has a bug where just defining a context menu handler will
// cancel the default context menu.
  // window.oncontextmenu = function(event) {
  //   event.preventDefault();
  // };

  document.getElementById('the-button').addEventListener('click', function(event) {
    event.preventDefault();

    var selection = window.getSelection(),
        anchorNode = selection.anchorNode,
        anchorOffset = selection.anchorOffset,
        focusNode = selection.focusNode,
        focusOffset = selection.focusOffset,
        textContent,
        selectedText,
        rotatedText;
    // isCollapsed indicates that the "selection" is just a cursor position,
    // basically.
    if (selection.isCollapsed) {
      return;
    }

    // if all the selected text is within a single DOM element, the process
    // is much simpler.
    if (anchorNode.isEqualNode(focusNode)) {
      textContent = anchorNode.textContent;
      selectedText = textContent.slice(anchorOffset, focusOffset);
      rotatedText = rot13(selectedText);
      anchorNode.textContent = textContent.slice(0, anchorOffset) +
                               rotatedText +
                               textContent.slice(focusOffset);
    } else {
      window.console.log('rot13 on complex text is not yet implemaunt');
    }

  });


  // these two are by bmock although I fixed his single-letter variables
  function rot13From(offset) {
    return function(text) {
      var charCode = text.charCodeAt(0) - offset;
      var rotated = (charCode + 13) % 26;
      return String.fromCharCode(offset + rotated);
    };
  }

  function rot13(text) {
    return text
      .replace(/[a-z]/g, rot13From("a".charCodeAt(0)))
      .replace(/[A-Z]/g, rot13From("A".charCodeAt(0)));
  }
})();
