const POKEMON_URL_PATTERN = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset"
let pokemon_offset = 0;
let fetchtedPokemon : Pokemon[] = new Array<Pokemon>();
let lastInnerHTML;
class Pokemon{
    name : string;
    detailLink :string;
    constructor(name : string, detail_link : string){
        this.name = name; 
        this.detailLink=detail_link;
    }
    get_Details(callback : (details : Pokemon_Detail)=> any) : void{
        fetch(this.detailLink).then((response: Response)=>{
            response.json().then((obj : any)=>{
                let abilities : string[] = new Array;
                for(let i=0;i<obj.abilities.length;i++){
                    abilities.push(obj.abilities[i].ability.name);
                }
                callback(new Pokemon_Detail(obj.name,obj.sprites.front_default,obj.height,obj.order,obj.weight,abilities));
            })
        })
    }
    toString() : string{
        return "Pokemon : name = "+this.name;
    }
    toHTML() : string{
        let htmlOutput = '<div class="row pokebox" style="background-color : @INS_COLOR;">'+
        '<div class="col-lg-2">Name : </div>'+
        '<div class="col-lg-8">@INS_NAME</div>'+
        '<div class="text-primary col-lg-2" onclick="loadDetails(\'@INS_NAME\');">Weitere Informationen</div>'+
        '</div>';
        htmlOutput = htmlOutput.replace('@INS_COLOR',getRandomColor());
        htmlOutput = htmlOutput.replace('@INS_NAME',this.name);
        htmlOutput = htmlOutput.replace('@INS_NAME',this.name);
        return htmlOutput;
    }
}
class Pokemon_Detail{
    name : string;
    imageurl : string;
    height : number;
    oder_number : number;
    weight : number;
    abilities : string[];
    constructor(name : string, imageurl: string, height : number, order_number : number, weight : number,abilities : string[]){
        this.name=name;
        this.imageurl=imageurl;
        this.height=height;
        this.oder_number=order_number;
        this.weight=weight;
        this.abilities=abilities;
    }
    toHTML() : string{
        let html : string = 
        '<button class="next-prev-button" onclick="goback();">Back</button>'+
        '<div class="row">'+
        '<div class="col-lg-5"><img src="$IMAGE_SRC" width="80%"></div>'+
        '<div class="col-lg-7">Name : $NAME</div>'+
        '</div>'+
        '<div clas="row">'+
            '<div class="col-lg-12">Details : </div>'+
        '</div>'+
        '<div class="row">'+
            '<div class="col-lg-4">Pokedex-Number : $NUM</div>'+
            '<div class="col-lg-4">Weight : $WEIGHT</div>'+
            '<div class="col-lg-4">Height : $HEIGHT</div>'+
        '</div>'+
        '<div class=row><div class="col-lg-12"> Abilities : $ABIlITIES</div>'
    '</div>'
    
    let abilities_string : string="";
    this.abilities.forEach((element : string,pos : number)=>{
        if(pos > 0){
            abilities_string=abilities_string+", "+element;
        }else{
            abilities_string=element;
        }
        
    })
    html = html.replace('$IMAGE_SRC',this.imageurl);
    html = html.replace('$NAME',this.name);
    html = html.replace('$NUM',this.oder_number.toString());
    html = html.replace('$HEIGHT',this.height.toString());
    html = html.replace('$WEIGHT',this.weight.toString());
    html = html.replace("$ABIlITIES",abilities_string);
    return html;
    }
}

function get_Pokemons(start : number,ammount : number,callback :(pokemons :Pokemon)=> any) : void{
    let url = "https://pokeapi.co/api/v2/pokemon/?limit=@limit&offset=@offset"
    let pokemon : Pokemon
    url = url.replace("@limit",ammount.toString());
    console.log(start);
    url = url.replace("@offset",start.toString());
    console.log(url)
    fetch(url).then(function(response : Response){
        response.json().then(function(obj){
            obj.results.forEach((element : any ,num : number) => {
                pokemon = new Pokemon(element.name,element.url);
                callback(pokemon);
            });
        })
    })
}
function main():void{
    get_Pokemons(1,25,((pokemon : Pokemon)=>{
        pokemon.get_Details((details : Pokemon_Detail)=>{
            console.log(details);
        }) 
    }));
}
function getRandomColor()  : string{
    var letters : string = '0123456789ABCDEF';
    var color  : string = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function loadPokemons(ammount : number) : void{
    get_Pokemons(pokemon_offset,ammount,(pokemon : Pokemon)=>{
        let innerHTML : string = document.getElementById("pokemon-container").innerHTML;
        console.log(pokemon);
        innerHTML=innerHTML + pokemon.toHTML();
        document.getElementById("pokemon-container").innerHTML=innerHTML;
        fetchtedPokemon.push(pokemon);
    })
    pokemon_offset=ammount+pokemon_offset;
}
function loadNext() : void{
    let element: HTMLInputElement = <HTMLInputElement>document.getElementById("number_input")
    let number  : number = parseInt(element.value);
    if(number < 100 && number > 0){
        clearContainer();
        loadPokemons(number);
    }
}
function loadPrev() : void{
    let element: HTMLInputElement = <HTMLInputElement>document.getElementById("number_input")
    let number  : number = parseInt(element.value);
    if(number < 100 && number <= pokemon_offset && number > 0){
        pokemon_offset = pokemon_offset - (2*number);
        clearContainer();
        loadPokemons(number);
    }
}
function clearContainer() : void{
    document.getElementById("pokemon-container").innerHTML="";
}
function loadDetails(name : string) :void { 
    lastInnerHTML = document.getElementById("pokemon-container").innerHTML;
    clearContainer();
    fetchtedPokemon.forEach((element : Pokemon)=>{
        if(element.name==name){
            element.get_Details((d : Pokemon_Detail)=>{
                document.getElementById("pokemon-container").innerHTML=d.toHTML();
            })
            
        }
    });
}
function goback() : void{
    document.getElementById("pokemon-container").innerHTML = lastInnerHTML;
}