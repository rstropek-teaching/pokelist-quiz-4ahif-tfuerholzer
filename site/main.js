var POKEMON_URL_PATTERN = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset";
var pokemon_offset = 0;
var fetchtedPokemon = new Array();
var lastInnerHTML;
var Pokemon = /** @class */ (function () {
    function Pokemon(name, detail_link) {
        this.name = name;
        this.detailLink = detail_link;
    }
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
    Pokemon.prototype.toString = function () {
        return "Pokemon : name = " + this.name;
    };
    Pokemon.prototype.toHTML = function () {
        var htmlOutput = '<div class="row pokebox" style="background-color : @INS_COLOR;">' +
            '<div class="col-lg-2">Name : </div>' +
            '<div class="col-lg-8">@INS_NAME</div>' +
            '<div class="text-primary col-lg-2" onclick="loadDetails(\'@INS_NAME\');">Weitere Informationen</div>' +
            '</div>';
        htmlOutput = htmlOutput.replace('@INS_COLOR', getRandomColor());
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
    Pokemon_Detail.prototype.toHTML = function () {
        var html = '<button class="next-prev-button" onclick="goback();">Back</button>' +
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
function get_Pokemons(start, ammount, callback) {
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
function main() {
    get_Pokemons(1, 25, (function (pokemon) {
        pokemon.get_Details(function (details) {
            console.log(details);
        });
    }));
}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function loadPokemons(ammount) {
    get_Pokemons(pokemon_offset, ammount, function (pokemon) {
        var innerHTML = document.getElementById("pokemon-container").innerHTML;
        console.log(pokemon);
        innerHTML = innerHTML + pokemon.toHTML();
        document.getElementById("pokemon-container").innerHTML = innerHTML;
        fetchtedPokemon.push(pokemon);
    });
    pokemon_offset = ammount + pokemon_offset;
}
function loadNext() {
    var element = document.getElementById("number_input");
    var number = parseInt(element.value);
    if (number < 100 && number > 0) {
        clearContainer();
        loadPokemons(number);
    }
}
function loadPrev() {
    var element = document.getElementById("number_input");
    var number = parseInt(element.value);
    if (number < 100 && number <= pokemon_offset && number > 0) {
        pokemon_offset = pokemon_offset - (2 * number);
        clearContainer();
        loadPokemons(number);
    }
}
function clearContainer() {
    document.getElementById("pokemon-container").innerHTML = "";
}
function loadDetails(name) {
    lastInnerHTML = document.getElementById("pokemon-container").innerHTML;
    clearContainer();
    fetchtedPokemon.forEach(function (element) {
        if (element.name == name) {
            element.get_Details(function (d) {
                document.getElementById("pokemon-container").innerHTML = d.toHTML();
            });
        }
    });
}
function goback() {
    document.getElementById("pokemon-container").innerHTML = lastInnerHTML;
}
