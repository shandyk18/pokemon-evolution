/**
 * Name: Shandy Kim
 * Date: April 28, 2021
 * Section: CSE 154 AH
 *
 * -- your description of what this file does here --
 */

 "use strict";

 (function() {

   /**
    * Add a function that will be called when the window is loaded.
    */
   window.addEventListener("load", init);

   /**
    * CHANGE: Describe what your init function does here.
    */
   function init() {
   }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

   /**
    * Returns the element that has the ID attribute with the specified value.
    * @param {string} idName - element ID
    * @returns {object} DOM object associated with id.
    */
   function id(idName) {
     return document.getElementById(idName);
   }

   /**
    * Returns the first element that matches the given CSS selector.
    * @param {string} selector - CSS query selector.
    * @returns {object} The first DOM object matching the query.
    */
   function qs(selector) {
     return document.querySelector(selector);
   }

   /**
    * Returns the array of elements that match the given CSS selector.
    * @param {string} selector - CSS query selector
    * @returns {object[]} array of DOM objects matching the query.
    */
   function qsa(selector) {
     return document.querySelectorAll(selector);
   }

   /**
    * Returns a new element with the given tag name.
    * @param {string} tagName - HTML tag name for new DOM element.
    * @returns {object} New DOM object for given HTML tag.
    */
   function gen(tagName) {
     return document.createElement(tagName);
   }

 })();