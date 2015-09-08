/* jshint browser:true */
(function() {
  'use strict';

/*
  TODO: IE8 has a bug where just defining a context menu handler will cancel
    the default context menu (according to MDN).
  TODO: Does IE support getSelection? I have unconfirmed reports it doesn't.
  TODO: What happens when there's text selected in e.g. a textarea?
*/

  // window.oncontextmenu = function(event) {
  //   event.preventDefault();
  // };

  document.getElementById('the-button').addEventListener('click', function(event) {
    event.preventDefault();

    var selection = window.getSelection(),
        startNode = selection.anchorNode,
        startOffset = selection.anchorOffset,
        endNode = selection.focusNode,
        endOffset = selection.focusOffset,
        restoredSelection,
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
    if (startNode.isEqualNode(endNode)) {
      textContent = startNode.textContent;
      selectedText = textContent.slice(startOffset, endOffset);
      rotatedText = rot13(selectedText);
      startNode.textContent = textContent.slice(0, startOffset) +
                              rotatedText +
                              textContent.slice(endOffset);
    } else {
      window.console.log('rot13 on complex text is not yet implemaunt');
    }

    restoredSelection = document.createRange();
    restoredSelection.setStart(startNode, startOffset);
    restoredSelection.setEnd(endNode, endOffset);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(restoredSelection);
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
