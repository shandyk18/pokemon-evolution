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

  // original colors from: https://bulbapedia.bulbagarden.net/wiki/Category:Type_color_templates
  const TYPE_COLOR = {
    bug: 'rgb(168, 184, 32, 0.7)',
    dark: 'rgb(112, 88, 72, 0.7)',
    dragon: 'rgb(112, 56, 248, 0.7)',
    electric: 'rgb(248, 208, 48, 0.7)',
    fairy: 'rgb(238, 153, 172, 0.7)',
    fighting: 'rgb(192, 48, 40, 0.7)',
    fire: 'rgb(240, 128, 48, 0.7)',
    flying: 'rgb(168, 144, 240, 0.7)',
    ghost: 'rgb(112, 88, 152, 0.7)',
    grass: 'rgb(120, 200, 80, 0.7)',
    ground: 'rgb(224, 192, 104, 0.7)',
    ice: 'rgb(152, 216, 216, 0.7)',
    normal: 'rgb(168, 168, 120, 0.7)',
    poison: 'rgb(160, 64, 160, 0.7)',
    psychic: 'rgb(248, 88, 136, 0.7)',
    rock: 'rgb(184, 160, 56, 0.7)',
    steel: 'rgb(184, 184, 208, 0.7)',
    unknown: 'rgb(104, 160, 144, 0.7)',
    water: 'rgb(104, 144, 240, 0.7)',
  };

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
      makePokemonSpeciesRequest(event);
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
    // strips punctuation, converts whitespace to '-', and converts to lowercase
    let formattedName = event.target.value.replace(/[.,\/#!$%\^&\*;:{}=\_`'~()]/g,"")
      .replace(/\s+/g, '-')
      .toLowerCase();
    let resp = await fetch(BASE_URL + "pokemon-species/" + formattedName);
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
   * @return {object} Array of Pokémon evolution stage names
   */
  function parseEvolution(evolutionChain) {
    let evolutionArray = [[evolutionChain.species.name]];
    let evolutionQueue = [evolutionChain.evolves_to];

    // follow evolution chain (nested in JSON) until queue is "empty"
    while (evolutionQueue[0] !== undefined && evolutionQueue[0].length !== 0) {
      evolutionChain = evolutionQueue.shift();
      let subEvolutionArray = [];

      // iterates through all pokémon that evolves from current species
      for (let field in evolutionChain) {

        // number represents a key to evolved pokémon
        if (!isNaN(parseInt(field))) {
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
   * @param {object} evolutionArray Array of Pokémon evolution stage names
   */
  async function generateTree(evolutionArray) {
    let container = id("poke-evolution");
    container.innerHTML = "";
    for (let stage of evolutionArray) {
      let arrow = gen("img");
      arrow.src = "./img/arrow.png";
      arrow.alt = "Arrow symbol";
      arrow.classList.add("arrow");
      await addStage(stage);
      container.appendChild(arrow);
    }
    container.removeChild(container.lastChild);
  }

  /**
   * Generates card(s) for each given Pokémon evolution stage
   * @param {string[]} stage Array of Pokémon names in this stage
   */
  async function addStage(stage) {
    let stageContainer = gen("poke-stage");
    stageContainer.classList.add("poke-stage");

    // add cards in evolution stage
    for (let name of stage) {
      let card = gen("div");
      let img = gen("img");
      let pokeInfo = await makePokemonRequest(name);
      img.src = pokeInfo.sprites.other["official-artwork"].front_default;
      img.alt = "Official artwork of " + name;
      card.appendChild(img);
      addCardStyle(card, pokeInfo);
      addCardText(card, name, pokeInfo);
      stageContainer.appendChild(card);
    }
    id("poke-evolution").appendChild(stageContainer);
  }

  function addCardText(card, name, pokeInfo) {
    let textName = gen("h3");
    let textType = gen("h3");
    textName.textContent = name;
    if (pokeInfo.types[1] === undefined) {
      textType.textContent = "type: " + pokeInfo.types[0].type.name;
    } else {
      textType.textContent = "type: " + pokeInfo.types[0].type.name +
        ", " + pokeInfo.types[1].type.name;
    }
    card.appendChild(textName);
    card.appendChild(textType);
  }

  function addCardStyle(card, pokeInfo) {
    card.classList.add("card");
    card.style.backgroundColor = TYPE_COLOR[pokeInfo.types[0].type.name];
    if (pokeInfo.types[1] !== undefined) {
      card.style.borderColor = TYPE_COLOR[pokeInfo.types[1].type.name];
    }
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