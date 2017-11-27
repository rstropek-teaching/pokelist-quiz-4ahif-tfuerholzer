 * @author Thomas Fürholzer <thomas.fuerholzer@gmail.com>
 * 
 */



function POKEMON_INIT(): void {
    //Global Variables
    const POKEMON_URL_PATTERN = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset"
    //URL Pattern to recieve data. @offset and @limit get replaced with the required values
    let pokemon_offset = 0;
    //Global varialbe that stores the current offset
    let fetchted_pokemon: Pokemon[] = new Array<Pokemon>();
    //Stores all fetched Pokemons - is required to lookup details
    let last_inner_HTML: string;
    //Saves the last HTML text which is overwritten when the details are shown

    class Pokemon {
        name: string;
        detailLink: string;
        constructor(name: string, detail_link: string) {
            this.name = name;
            this.detailLink = detail_link;
        }
        /**
         * Fetches and parses the details of this pokemon. Calls callback after this with the details.
         * @param {function(details : Pokemon_Details)} callback 
         */
        get_Details(callback: (details: Pokemon_Detail) => any): void {
            fetch(this.detailLink).then((response: Response) => {
                response.json().then((obj: any) => {
                    let abilities: string[] = new Array;
                    for (let i = 0; i < obj.abilities.length; i++) {
                        abilities.push(obj.abilities[i].ability.name);
                    }
                    callback(new Pokemon_Detail(obj.name, obj.sprites.front_default, obj.height, obj.order, obj.weight, abilities));
                })
            })
        }
        /**
         * Simple function that generates a String
         * @return {string}
         */
        toString(): string {
            return "Pokemon : name = " + this.name;
        }
        /**
         * Generates HTML-Text from the pokemon-object.
         * @return {string} HTML Text
         */
        toHTML(): string {
            let htmlOutput = '<div class="row pokebox" style="background-color : @INS_COLOR;">' +
                '<div class="col-lg-2">Name : </div>' +
                '<div class="col-lg-8">@INS_NAME</div>' +
                '<div class="text-primary col-lg-2" id="getDetails_@INS_NAME">Weitere Informationen</div>' +
                '</div>';
            htmlOutput = htmlOutput.replace('@INS_COLOR', get_random_color());
            htmlOutput = htmlOutput.replace('@INS_NAME', this.name);
            htmlOutput = htmlOutput.replace('@INS_NAME', this.name);
            return htmlOutput;
        }
    }
    class Pokemon_Detail {
        name: string;
        imageurl: string;
        height: number;
        oder_number: number;
        weight: number;
        abilities: string[];
        constructor(name: string, imageurl: string, height: number, order_number: number, weight: number, abilities: string[]) {
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
        toHTML(): string {
            let html: string =
                '<button class="next-prev-button" id="goback">Back</button>' +
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
                '<div class=row><div class="col-lg-12"> Abilities : $ABIlITIES</div>'
            '</div>'

            let abilities_string: string = "";
            this.abilities.forEach((element: string, pos: number) => {
                if (pos > 0) {
                    abilities_string = abilities_string + ", " + element;
                } else {
                    abilities_string = element;
                }

            })
            html = html.replace('$IMAGE_SRC', this.imageurl);
            html = html.replace('$NAME', this.name);
            html = html.replace('$NUM', this.oder_number.toString());
            html = html.replace('$HEIGHT', this.height.toString());
            html = html.replace('$WEIGHT', this.weight.toString());
            html = html.replace("$ABIlITIES", abilities_string);
            return html;
        }
    }
    /**
     * A function that fetches and parses Pokemons from the API. After one Pokemon is parsed callback(pokemon) will be called.
     * It is not adviced to call this function on its own => use load_pokemons() instead
     * @param {number} start Defines the start where the pokemons will be fetched.
     * @param {number} ammount Defines the ammount of pokemons that will be fetched
     * @param {(pokemon : Pokemon)} callback  Function that is called after one pokemon is fetched and parsed
     * @private
     */
    function get_pokemons(start: number, ammount: number, callback: (pokemons: Pokemon) => any): void {
        let url = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset"
        let pokemon: Pokemon
        url = url.replace("@limit", ammount.toString());
        console.log(start);
        url = url.replace("@offset", start.toString());
        console.log(url)
        fetch(url).then(function (response: Response) {
            response.json().then(function (obj) {
                obj.results.forEach((element: any, num: number) => {
                    pokemon = new Pokemon(element.name, element.url);
                    callback(pokemon);
                });
            })
        })
    }
    /**
     * Generates a random color
     * @return {string} returns a random color in '#ffffff' Format
     */
    function get_random_color(): string {
        let letters: string = '0123456789ABCDEF';
        let color: string = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    /**
     * Uses get_pokemons to fetch for pokemons and injects them into the current HTML Page.
     * Furthermore it also adjusts the global variables pokemon_offset, fetched_pokemon, last_inner_html
     * @param {number} ammount Defines the ammount of pokemons the will be loaded
     */
    function load_pokemons(ammount: number): void {
        get_pokemons(pokemon_offset, ammount, (pokemon: Pokemon) => {
            let innerHTML: string = document.getElementById("pokemon-container").innerHTML;
            innerHTML = innerHTML + pokemon.toHTML();
            document.getElementById("pokemon-container").innerHTML = innerHTML;
            fetchted_pokemon.push(pokemon);
            setTimeout(() => {
                document.getElementById("getDetails_" + pokemon.name).addEventListener('click', () => {
                    load_details(pokemon.name);
                }, false);
            }, 25)

        })
        pokemon_offset = ammount + pokemon_offset;
    }
    /**
     * Loads the next pokemons and using the and HTML <input> element
     */
    function load_next(): void {
        let element: HTMLInputElement = <HTMLInputElement>document.getElementById("number_input")
        let number: number = parseInt(element.value);
        if (number < 100 && number > 0) {
            clear_container();
            load_pokemons(number);
        }
    }
    /**
     * Loads the previous pokemons and using the and HTML <input> element
     */
    function load_prev(): void {
        let element: HTMLInputElement = <HTMLInputElement>document.getElementById("number_input")
        let number: number = parseInt(element.value);
        if (number < 100 && number <= pokemon_offset && number > 0) {
            pokemon_offset = pokemon_offset - (2 * number);
            clear_container();
            load_pokemons(number);
        }
    }
    /**
     * Cleans up the "pokemon-container" Element
     */
    function clear_container(): void {
        document.getElementById("pokemon-container").innerHTML = "";
    }
    /**
     * Loads the details of a pokemon. The function looks up in fetched_pokemon where the all
     * loaded Pokemons are located.
     * @param {string} name name of the pokemon
     */
    function load_details(name: string): void {
        last_inner_HTML = document.getElementById("pokemon-container").innerHTML;
        clear_container();
        fetchted_pokemon.forEach((element: Pokemon) => {
            if (element.name == name) {
                element.get_Details((d: Pokemon_Detail) => {
                    document.getElementById("pokemon-container").innerHTML = d.toHTML();
                })

            }
        });
        setTimeout(() => {
            document.getElementById("goback").addEventListener("click", () => {
                goback()
            }, false);
        }, 25);

    }
    /**
     * Replaces the content of pokemon-container with the last_inner_HTML (which is the content
     * before the details are show) to simulate a "going back".
     */
    function goback(): void {
        document.getElementById("pokemon-container").innerHTML = last_inner_HTML;
    }
    /**
     * Function that sets the event-handlers on the loadnext and loadprev buttons.
     */
    function setEventHandlers(): void {
        document.getElementById("loadprev").addEventListener('click', load_prev, false);
        document.getElementById("loadnext").addEventListener('click', load_next, false);
    }
    load_pokemons(10);
    setTimeout(setEventHandlers, 250);
}
