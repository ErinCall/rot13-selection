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

    var selection = window.getSelection();
    // isCollapsed indicates that the "selection" is just a cursor position,
    // basically.
    if (selection.isCollapsed) {
      return;
    }

    // if all the selected text is within a single DOM element, the process
    // is much simpler.
    if (selection.anchorNode.isEqualNode(selection.focusNode)) {
      var textContent = selection.anchorNode.textContent;
      var selectedText = textContent.slice(selection.anchorOffset, selection.focusOffset);
      var rotatedText = rot13(selectedText);
      selection.anchorNode.textContent = textContent.slice(0, selection.anchorOffset) + rotatedText + textContent.slice(selection.focusOffset);
    } else {
      console.log('rot13 on complex text is not yet implemaunt');
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
