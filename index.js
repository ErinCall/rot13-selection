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
    rotateSelection();
  });

  // Apply rot13 to all the text in the given selection, preserving document
  // structure.
  function rotateSelection() {
    var selection = window.getSelection(),
        startNode = selection.getRangeAt(0).startContainer,
        startOffset = selection.getRangeAt(0).startOffset,
        endNode = selection.getRangeAt(0).endContainer,
        endOffset = selection.getRangeAt(0).endOffset,
        restoredSelection;
    // isCollapsed indicates that the "selection" is just a cursor position,
    // basically. There's no text selected and nothing to do.
    if (selection.isCollapsed) {
      return;
    }

    rotateStartingAtNode(startNode, startOffset, endNode, endOffset);

    restoredSelection = document.createRange();
    /*
    According to the MDN docs, this code should be
    restoredSelection.setStart(startNode, startOffset);
    restoredSelection.setEnd(endNode, endOffset);
    and indeed, that would make a lot more sense. It doesn't work in firefox,
    though, and the code here does!
    */
    restoredSelection.setStart(endNode, endOffset);
    restoredSelection.setStart(startNode, startOffset);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(restoredSelection);
  }

  /*
  This function does the work of walking across the various nodes in a
  selection range. It calls rotateNodeText when it finds a textNode and self-
  recurses otherwise. Eventually it will throw {message: 'reachedEnd'},
  blowing away its own call stack. Typically you'll want to use the "public
  wrapper," rotateStartingAtNode, instead of this function.
  */
  function _rotateStartingAtNode(node, startOffset, endNode, endOffset) {
    if (node.isEqualNode(endNode)) {
      // We've found the last (possibly only) node in the selection! Rotate
      // its text, then throw reachedEnd to stop any recursion/stepping that
      // might be underway upstack.
      rotateNodeText(node, startOffset, endOffset);
      throw {message: 'reachedEnd'};
    } else {
      if (node.nodeName === '#text') {
        // We are looking at a text node. Rotate its text! rotateNodeText gets
        // the text's length as its endOffset, since this isn't the last node.
        rotateNodeText(node, startOffset, node.textContent.length);
        _rotateStartingAtNode(nextNode(node), 0, endNode, endOffset);
      } else if (node.childNodes.length > 0) {
        // We're looking at some sort of element node that may have textNodes
        // somewhere among its descendants. We don't need to loop over all of
        // them, since the recursed call will find the first element's
        // siblings for us. We also don't need to find this node's own
        // sibling; once its child siblings are all done, nextNode will come
        // back up to this node and proceed.
        _rotateStartingAtNode(node.childNodes[0], 0, endNode, endOffset);
      } else {
        // We've found ourselves looking at an empty element. That shouldn't
        // happen in a well-structured document, but we all know how often
        // documents are well-structured. Whatever, just move on to the next
        // node in the document.
        _rotateStartingAtNode(nextNode(node), 0, endNode, endOffset);
      }
    }
  }

  // Public wrapper for _rotateStartingAtNode. Catches the reachedEnd message.
  function rotateStartingAtNode(node, startOffset, endNode, endOffset) {
    try {
      _rotateStartingAtNode(node, startOffset, endNode, endOffset);
    } catch (e) {
      if (! e.message || e.message !== 'reachedEnd') {
        throw e;
      }
    }
  }

  // Replace the relevant part of the text in the given node with its rot13ed
  // counterpart.
  function rotateNodeText(node, startOffset, endOffset) {
      var textContent = node.textContent,
          selectedText = textContent.slice(startOffset, endOffset),
          rotatedText = rot13(selectedText);

      node.textContent = textContent.slice(0, startOffset) +
                         rotatedText +
                         textContent.slice(endOffset);
  }

  // Try and find the node that comes after the given node.
  function nextNode(node) {
    if (node.nextSibling !== null) {
      return node.nextSibling;
    } else if (node.parentNode !== null) {
      return nextNode(node.parentNode);
    } else {
      throw "nextNode found itself looking at the topmost node, document. " +
            "This probably means there was a mistake in the stepping/" +
            "recursion logic in _rotateStartingAtNode; it should have hit " +
            "the node.isEqualNode(endNode) case, but instead seems to have " +
            "skipped over the endNode and walked all the way to the end of " +
            "the document."
    }
  }

  /*
  Adapted from some code by Brian Mock
  Given a character code (65 or 92, ASCII A or a, in practice), returns a
  rot13 function for letters whose character code is within 26 of the given
  one.
  */
  function rot13From(offset) {
    return function(text) {
      var charCode = text.charCodeAt(0) - offset;
      var rotated = (charCode + 13) % 26;
      return String.fromCharCode(offset + rotated);
    };
  }

  /*
  Adapted from some code by Brian Mock
  Rotate upper- and lower-case ASCII letters forward by 13, wrapping at the
  alphabet. Returns a copy of the input.
  */
  function rot13(text) {
    return text
      .replace(/[a-z]/g, rot13From("a".charCodeAt(0)))
      .replace(/[A-Z]/g, rot13From("A".charCodeAt(0)));
  }
})();
