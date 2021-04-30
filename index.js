/**
 * Name: Shandy Kim
 * Date: April 28, 2021
 * Section: CSE 154 AH
 *
 * -- your description of what this file does here --
 */

"use strict";

(function() {

  const BASE_URL = "https://pokeapi.co/api/v2/";

  /**
   * Add a function that will be called when the window is loaded.
   */
  window.addEventListener("load", init);

  /**
   * CHANGE: Describe what your init function does here.
   */
  function init() {
    id("poke-name").addEventListener("keypress", (e) => makeRequest(e));
  }

  /**
   *
   * @param {*} e
   */
  async function makeRequest(e) {
    if (e.key === "Enter") {
      try {
        let basePokemon = await makePokemonSpeciesRequest(e);
        let evolutionChain = await makeEvolutionRequest(basePokemon.evolution_chain.url);
        let evolutionArray = parseEvolution(evolutionChain.chain);
        generateTree(evolutionArray);
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   *
   * @param {*} name
   * @returns
   */
  async function makePokemonRequest(name) {
    let resp = await fetch(BASE_URL + "pokemon/" + name);
    resp = await statusCheck(resp);
    resp = await resp.json();
    return resp;
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  async function makePokemonSpeciesRequest(event) {
    let resp = await fetch(BASE_URL + "pokemon-species/" + event.target.value.toLowerCase());
    resp = await statusCheck(resp);
    resp = await resp.json();
    return resp;
  }

  /**
   *
   * @param {*} evolutionURL
   * @returns
   */
  async function makeEvolutionRequest(evolutionURL) {
    let resp = await fetch(evolutionURL);
    resp = await statusCheck(resp);
    resp = await resp.json();
    return resp;
  }

  /**
   *
   * @param {*} evolutionChain
   * @returns
   */
  function parseEvolution(evolutionChain) {
    let evolutionArray = [evolutionChain.species.name];
    let evolutionQueue = [evolutionChain.evolves_to];

    // follow evolution chain until end
    while (evolutionQueue[0] !== undefined && evolutionQueue[0].length !== 0) {
      evolutionChain = evolutionQueue.shift();
      for (let field in evolutionChain) {
        console.log(field);
        if (parseInt(field) !== NaN) {
          evolutionArray.push(evolutionChain[field].species.name);
          evolutionQueue.push(evolutionChain[field].evolves_to);
        }
      }
    }
    console.log(evolutionArray);
    return evolutionArray;
  }

  /**
   *
   * @param {*} evolutionArray
   */
  async function generateTree(evolutionArray) {
    id("poke-evolution").innerHTML = "";
    for (let name of evolutionArray) {
      await addImage(name);
    }
  }

  /**
   *
   * @param {*} name
   */
  async function addImage(name) {
    let img = gen("img");
    let pokeInfo = await makePokemonRequest(name);
    img.src = pokeInfo.sprites.other["official-artwork"].front_default;
    img.alt = "Official artwork of " + name;
    id("poke-evolution").appendChild(img);
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