/**
 * Name: Shandy Kim
 * Date: April 28, 2021
 * Section: CSE 154 AH
 *
 * This file is responsible for displaying Pokémon evolution diagrams through PokéAPI.
 * Only valid Pokémon names are accepted and can correctly display a diagram.
 */

"use strict";

(function() {

  const BASE_URL = "https://pokeapi.co/api/v2/";

  /**
   * Add a function that will be called when the window is loaded.
   */
  window.addEventListener("load", init);

  /**
   * Initializes event listener for Pokemon name input
   */
  function init() {
    id("poke-name").addEventListener("keypress", event => makeRequest(event));
  }

  /**
   * Makes a request for given Pokemon name to show evolution diagram
   * @param {object} event Event fired when 'enter' is pressed
   */
  async function makeRequest(event) {
    if (event.key === "Enter") {
      try {
        let basePokemon = await makePokemonSpeciesRequest(event);
        let evolutionChain = await makeEvolutionRequest(basePokemon.evolution_chain.url);
        let evolutionArray = parseEvolution(evolutionChain.chain);
        generateTree(evolutionArray);
      } catch (err) {
        handleError();
      }
    }
  }

  /**
   * Displays error message when an error occurs
   */
  function handleError() {
    let message = gen("p");
    message.classList.add("error");
    message.textContent = "Unable to find Pokémon requested. Please try again.";
    id("poke-evolution").innerHTML = "";
    id("poke-evolution").appendChild(message);
  }

  /**
   * Fetches Pokémon information given valid name
   * @param {string} name Given Pokémon name from user
   * @return {object} JSON of received response
   */
  async function makePokemonRequest(name) {
    let resp = await fetch(BASE_URL + "pokemon/" + name);
    resp = await statusCheck(resp);
    resp = await resp.json();
    return resp;
  }

  /**
   * Fetches Pokémon species information given valid name
   * @param {object} event Event fired when 'enter' is pressed
   * @return {object} JSON of received response
   */
  async function makePokemonSpeciesRequest(event) {
    let resp = await fetch(BASE_URL + "pokemon-species/" + event.target.value.toLowerCase());
    resp = await statusCheck(resp);
    resp = await resp.json();
    return resp;
  }

  /**
   * Fetches Pokémon evolution information given valid URL
   * @param {string} evolutionURL evolution URL of a Pokémon species
   * @return {object} JSON of received response
   */
  async function makeEvolutionRequest(evolutionURL) {
    let resp = await fetch(evolutionURL);
    resp = await statusCheck(resp);
    resp = await resp.json();
    return resp;
  }

  /**
   * Parses Pokémon evolution JSON into different evolution stages
   * @param {object} evolutionChain JSON of Pokémon species evolution
   * @return {string[][]} Array of Pokémon evolution stage names
   */
  function parseEvolution(evolutionChain) {
    let evolutionArray = [[evolutionChain.species.name]];
    let evolutionQueue = [evolutionChain.evolves_to];

    // follow evolution chain until end
    while (evolutionQueue[0] !== undefined && evolutionQueue[0].length !== 0) {
      evolutionChain = evolutionQueue.shift();
      let subEvolutionArray = [];
      for (let field in evolutionChain) {
        if (parseInt(field) !== NaN) {
          subEvolutionArray.push(evolutionChain[field].species.name);
          evolutionQueue.push(evolutionChain[field].evolves_to);
        }
      }
      evolutionArray.push(subEvolutionArray);
    }
    return evolutionArray;
  }

  /**
   * Generates Pokémon evolution tree stage-by-stage
   * @param {string[][]} evolutionArray Array of Pokémon evolution stage names
   */
  async function generateTree(evolutionArray) {
    id("poke-evolution").innerHTML = "";
    for (let stage of evolutionArray) {
      await addStage(stage);
    }
  }

  /**
   * Generates card(s) for each given Pokémon evolution stage
   * @param {string[]} stage Array of Pokémon names in this stage
   */
  async function addStage(stage) {
    let stageContainer = gen("poke-stage");
    stageContainer.classList.add("poke-stage");
    for (let name of stage) {
      let card = gen("div");
      let img = gen("img");
      let text = gen("h3");
      let pokeInfo = await makePokemonRequest(name);
      card.classList.add("card");
      img.src = pokeInfo.sprites.other["official-artwork"].front_default;
      img.alt = "Official artwork of " + name;
      text.textContent = name;
      card.appendChild(img);
      card.appendChild(text);
      stageContainer.appendChild(card);
    }
    id("poke-evolution").appendChild(stageContainer);
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
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();