/**
 * @author Thomas Fürholzer <thomas.fuerholzer@gmail.com>
 *
 */
function POKEMON_INIT() {
    //Global Variables
    var POKEMON_URL_PATTERN = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset";
    //URL Pattern to recieve data. @offset and @limit get replaced with the required values
    var pokemon_offset = 0;
    //Global varialbe that stores the current offset
    var fetchted_pokemon = new Array();
    //Stores all fetched Pokemons - is required to lookup details
    var last_inner_HTML;
    //Saves the last HTML text which is overwritten when the details are shown
    var Pokemon = /** @class */ (function () {
        function Pokemon(name, detail_link) {
            this.name = name;
            this.detailLink = detail_link;
        }
        /**
         * Fetches and parses the details of this pokemon. Calls callback after this with the details.
         * @param {function(details : Pokemon_Details)} callback
         */
        Pokemon.prototype.get_Details = function (callback) {
            fetch(this.detailLink).then(function (response) {
                response.json().then(function (obj) {
                    var abilities = new Array;
                    for (var i = 0; i < obj.abilities.length; i++) {
                        abilities.push(obj.abilities[i].ability.name);
                    }
                    callback(new Pokemon_Detail(obj.name, obj.sprites.front_default, obj.height, obj.order, obj.weight, abilities));
                });
            });
        };
        /**
         * Simple function that generates a String
         * @return {string}
         */
        Pokemon.prototype.toString = function () {
            return "Pokemon : name = " + this.name;
        };
        /**
         * Generates HTML-Text from the pokemon-object.
         * @return {string} HTML Text
         */
        Pokemon.prototype.toHTML = function () {
            var htmlOutput = '<div class="row pokebox" style="background-color : @INS_COLOR;">' +
                '<div class="col-lg-2">Name : </div>' +
                '<div class="col-lg-8">@INS_NAME</div>' +
                '<div class="text-primary col-lg-2" id="getDetails_@INS_NAME">Weitere Informationen</div>' +
                '</div>';
            htmlOutput = htmlOutput.replace('@INS_COLOR', get_random_color());
            htmlOutput = htmlOutput.replace('@INS_NAME', this.name);
            htmlOutput = htmlOutput.replace('@INS_NAME', this.name);
            return htmlOutput;
        };
        return Pokemon;
    }());
    var Pokemon_Detail = /** @class */ (function () {
        function Pokemon_Detail(name, imageurl, height, order_number, weight, abilities) {
            this.name = name;
            this.imageurl = imageurl;
            this.height = height;
            this.oder_number = order_number;
            this.weight = weight;
            this.abilities = abilities;
        }
        /**
         * Generates HTML Text from the pokemon_details-object
         * @return {string} HTML Text
         */
        Pokemon_Detail.prototype.toHTML = function () {
            var html = '<button class="next-prev-button" id="goback">Back</button>' +
                '<div class="row">' +
                '<div class="col-lg-5"><img src="$IMAGE_SRC" width="80%"></div>' +
                '<div class="col-lg-7">Name : $NAME</div>' +
                '</div>' +
                '<div clas="row">' +
                '<div class="col-lg-12">Details : </div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-lg-4">Pokedex-Number : $NUM</div>' +
                '<div class="col-lg-4">Weight : $WEIGHT</div>' +
                '<div class="col-lg-4">Height : $HEIGHT</div>' +
                '</div>' +
                '<div class=row><div class="col-lg-12"> Abilities : $ABIlITIES</div>';
            '</div>';
            var abilities_string = "";
            this.abilities.forEach(function (element, pos) {
                if (pos > 0) {
                    abilities_string = abilities_string + ", " + element;
                }
                else {
                    abilities_string = element;
                }
            });
            html = html.replace('$IMAGE_SRC', this.imageurl);
            html = html.replace('$NAME', this.name);
            html = html.replace('$NUM', this.oder_number.toString());
            html = html.replace('$HEIGHT', this.height.toString());
            html = html.replace('$WEIGHT', this.weight.toString());
            html = html.replace("$ABIlITIES", abilities_string);
            return html;
        };
        return Pokemon_Detail;
    }());
    /**
     * A function that fetches and parses Pokemons from the API. After one Pokemon is parsed callback(pokemon) will be called.
     * It is not adviced to call this function on its own => use load_pokemons() instead
     * @param {number} start Defines the start where the pokemons will be fetched.
     * @param {number} ammount Defines the ammount of pokemons that will be fetched
     * @param {(pokemon : Pokemon)} callback  Function that is called after one pokemon is fetched and parsed
     * @private
     */
    function get_pokemons(start, ammount, callback) {
        var url = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset";
        var pokemon;
        url = url.replace("@limit", ammount.toString());
        console.log(start);
        url = url.replace("@offset", start.toString());
        console.log(url);
        fetch(url).then(function (response) {
            response.json().then(function (obj) {
                obj.results.forEach(function (element, num) {
                    pokemon = new Pokemon(element.name, element.url);
                    callback(pokemon);
                });
            });
        });
    }
    /**
     * Generates a random color
     * @return {string} returns a random color in '#ffffff' Format
     */
    function get_random_color() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    /**
     * Uses get_pokemons to fetch for pokemons and injects them into the current HTML Page.
     * Furthermore it also adjusts the global variables pokemon_offset, fetched_pokemon, last_inner_html
     * @param {number} ammount Defines the ammount of pokemons the will be loaded
     */
    function load_pokemons(ammount) {
        get_pokemons(pokemon_offset, ammount, function (pokemon) {
            var innerHTML = document.getElementById("pokemon-container").innerHTML;
            innerHTML = innerHTML + pokemon.toHTML();
            document.getElementById("pokemon-container").innerHTML = innerHTML;
            fetchted_pokemon.push(pokemon);
            setTimeout(function () {
                document.getElementById("getDetails_" + pokemon.name).addEventListener('click', function () {
                    load_details(pokemon.name);
                }, false);
            }, 25);
        });
        pokemon_offset = ammount + pokemon_offset;
    }
    /**
     * Loads the next pokemons and using the and HTML <input> element
     */
    function load_next() {
        var element = document.getElementById("number_input");
        var number = parseInt(element.value);
        if (number < 100 && number > 0) {
            clear_container();
            load_pokemons(number);
        }
    }
    /**
     * Loads the previous pokemons and using the and HTML <input> element
     */
    function load_prev() {
        var element = document.getElementById("number_input");
        var number = parseInt(element.value);
        if (number < 100 && number <= pokemon_offset && number > 0) {
            pokemon_offset = pokemon_offset - (2 * number);
            clear_container();
            load_pokemons(number);
        }
    }
    /**
     * Cleans up the "pokemon-container" Element
     */
    function clear_container() {
        document.getElementById("pokemon-container").innerHTML = "";
    }
    /**
     * Loads the details of a pokemon. The function looks up in fetched_pokemon where the all
     * loaded Pokemons are located.
     * @param {string} name name of the pokemon
     */
    function load_details(name) {
        last_inner_HTML = document.getElementById("pokemon-container").innerHTML;
        clear_container();
        fetchted_pokemon.forEach(function (element) {
            if (element.name == name) {
                element.get_Details(function (d) {
                    document.getElementById("pokemon-container").innerHTML = d.toHTML();
                });
            }
        });
        setTimeout(function () {
            document.getElementById("goback").addEventListener("click", function () {
                goback();
            }, false);
        }, 25);
    }
    /**
     * Replaces the content of pokemon-container with the last_inner_HTML (which is the content
     * before the details are show) to simulate a "going back".
     */
    function goback() {
        document.getElementById("pokemon-container").innerHTML = last_inner_HTML;
    }
    /**
     * Function that sets the event-handlers on the loadnext and loadprev buttons.
     */
    function setEventHandlers() {
        document.getElementById("loadprev").addEventListener('click', load_prev, false);
        document.getElementById("loadnext").addEventListener('click', load_next, false);
    }
    load_pokemons(10);
    setTimeout(setEventHandlers, 250);
}
