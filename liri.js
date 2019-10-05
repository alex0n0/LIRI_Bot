const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
var Spotify = require('node-spotify-api');

var keys = require('./keys.js');









var apiKeyBandsInTown = keys.keys.bands_in_town_key;
var apiKeyOMDb = keys.keys.omdb_key;
var apiKeySpotifyId = keys.keys.spotify_id;
var apiKeySpotifySecret = keys.keys.spotify_secret;

var spotify = new Spotify({
    id: apiKeySpotifyId,
    secret: apiKeySpotifySecret
});


















var logFilePath = './assets/log.txt';
var randomFilePath = './assets/random.txt';

var operationTypes = ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says']
// set the MAX number of query results to show
var limitForMultipleQueryResults = 5;


















// wrap the operation and search term variables in a function
// run the function to begin the prompts
runInquirer();
function runInquirer() {
    var operation;
    var searchTerm;
    inquirer.prompt([
        {
            type: 'list',
            name: 'operation',
            message: 'Choose an operation',
            choices: operationTypes
        }
    ]).then(answer => {
        // if the last option ('do-what-it-says') is chosen, run the query from random.txt file
        if (answer.operation === operationTypes[operationTypes.length - 1]) {
            runSearchFromFile();
        }
        // otherwise show prompt for inputting search term
        else {
            operation = answer.operation;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'searchTerm',
                    message: 'Enter a search term',
                    validate: function (input) {
                        return input.length > 0;
                    }
                }
            ]).then(answer => {
                // certain APIs do not work well with special characters and symbols, thus they are removed
                searchTerm = answer.searchTerm.toLowerCase().replace(/[.']/g, '');

                //run the API call on the search term
                runSearchFromTerminal({ operation: operation, searchTerm: searchTerm });
            });
        }
    });
}















// terminal details: do-what-it-says
// random.txt file has operation and searchTerms inside objects inside an array (as a string)
// it is parsed into an the runSearchFromTerminal() function which is eventually called again by an inner function
function runSearchFromFile() {
    fs.readFile(randomFilePath, 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
        }

        let randomFileArr = JSON.parse(data);
        let singleObj = randomFileArr.shift();
        // objects are passed as arguments instead of variables because some values are optional (randomFileArr)
        runSearchFromTerminal({ operation: singleObj.operation, searchTerm: singleObj.searchTerm, randomFileArr: randomFileArr });
    });
}

function runSearchFromTerminal(obj) {
    try {
        // if the log.txt file already exists, create a 2 line break for legibility
        if (fs.existsSync(logFilePath)) {
            appendLine();
        }
    } catch (err) {
        console.error(err)
    }
    switch (obj.operation) {
        case operationTypes[0]:
            // default search values not provided
            queryBandsInTownAPI({ searchTerm: obj.searchTerm, randomFileArr: obj.randomFileArr });
            break;
        case operationTypes[1]:
            if (obj.searchTerm.trim().length === 0) {
                // defaults search for 'the sign' (NOTE: second parameter is optional) AS PER HOMEWORK REQUIREMENTS
                querySpotifyAPI({ searchTerm: 'the sign', artist: 'ace of base' });
            } else {
                querySpotifyAPI({ searchTerm: obj.searchTerm, randomFileArr: obj.randomFileArr });
            }
            break;
        case operationTypes[2]:
            if (obj.searchTerm.trim().length === 0) {
                // default search for 'mr nobody' AS PER HOMEWORK REQUIREMENTS
                queryOMDdAPI({ searchTerm: 'mr nobody' });
            } else {
                queryOMDdAPI({ searchTerm: obj.searchTerm, randomFileArr: obj.randomFileArr });
            }
            break;
        default:
            console.log('**** Something went wrong at runSearchFromTerminal()');
    }
}
















// (# Helper A) Utility function for processing 'do-what-it-says'
function doWhatItSaysHelper(randomFileArr) {
    if (randomFileArr) {
        console.log('#############', randomFileArr.length, 'random items remaining');
        if (randomFileArr.length > 0) {
            let singleObj = randomFileArr.shift();
            runSearchFromTerminal({ operation: singleObj.operation, searchTerm: singleObj.searchTerm, randomFileArr: randomFileArr });
        } else {
            console.log('all random files queried');
        }
    }
}

// terminal details: node liri.js concert-this '<artist/band name here>'
// api url: "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
// info: venue name | location | event date (MM/DD/YYYY)
function queryBandsInTownAPI(obj) {
    console.log('\n\n>>>>>>>>>> concert-this [' + obj.searchTerm + '] >>>>>>>>>>');
    appendLine('>>>>>>>>>> concert-this [' + obj.searchTerm + '] >>>>>>>>>> run @ ' + new Date().toUTCString());
    // axios call result can have 3 variations:
    //// STATE 1: artist found w/concerts -> may return multiple concerts
    //// STATE 2: artist found w/o concerts
    //// STATE 3: artist not found
    axios.get("https://rest.bandsintown.com/artists/" + obj.searchTerm + "/events?app_id=" + apiKeyBandsInTown)
        .then(res => {
            var response = res.data;

            // valid queries return an array (either EMPTY or AT LEAST ONE VALUE)
            // invalid queries does not return an array
            if (Array.isArray(response)) {
                if (response.length !== 0) {
                    // Getting and Formatting relevant data using JSON.stringify
                    var formattedResponse = JSON.stringify(
                        response.slice(0, limitForMultipleQueryResults).map((currentValue) => {
                            var dateString = currentValue.datetime
                            var ymdString = dateString.split('T');
                            var ymdArr = ymdString[0].split('-');
                            var mmddyyyyString = ymdArr[1] + '/' + ymdArr[2] + '/' + ymdArr[0] + ' (mm/dd/yyyy)';
                            return {
                                venue_name: currentValue.venue.name,
                                venue_location: currentValue.venue.city + ', ' + currentValue.venue.country,
                                date: mmddyyyyString
                            }
                        }), null, 2);
                    // STATE 1: artist found w/concerts
                    console.log('[ok] (max ' + limitForMultipleQueryResults + ') ' + formattedResponse);
                    appendLine('[ok] (max ' + limitForMultipleQueryResults + ') ' + formattedResponse);
                } else {
                    // STATE 2: artist found w/o concerts
                    console.log('[ok] BandsInTownAPI: [' + obj.searchTerm + '] currently does not have any concerts');
                    appendLine('[ok] BandsInTownAPI: [' + obj.searchTerm + '] currently does not have any concerts');
                }
            } else {
                // STATE 3: artist not found
                console.log('[ok] BandsInTown API: nothing found for [' + obj.searchTerm + ']');
                appendLine('[ok] BandsInTown API: nothing found for [' + obj.searchTerm + ']');
            }
        }).catch((err) => {
            // ERROR STATE: when none of the above states are met
            console.log('[error] Something went wrong at queryBandsInTownAPI()');
            appendLine('[error] Something went wrong at queryBandsInTownAPI()');
        }).finally(() => {
            // (# Helper A) this block of code is used ONLY for processing 'do-what-it-says'
            // it exists in the finally block because the script should attempt ALL API calls in randomFileArr even if one call fails
            doWhatItSaysHelper(obj.randomFileArr);
        });
}




// terminal details: node liri.js spotify-this-song '<song name here>'
// default search term: 'the sign' by 'ace of base'
// info: artist/s | song name | preview link of song to spotify | song album
function querySpotifyAPI(obj) {
    console.log('\n\n>>>>>>>>>> spotify-this-song [' + obj.searchTerm + '] >>>>>>>>>>');
    appendLine('>>>>>>>>>> spotify-this-song [' + obj.searchTerm + '] >>>>>>>>>> run @ ' + new Date().toUTCString());

    // node-spotify-api' call result can have 2 variations:
    //// STATE 1: song found -> may return multiple songs
    //// STATE 2: song not found
    spotify
        .search({ type: 'track', query: obj.searchTerm })
        .then((res) => {

            var response = res.tracks.items;

            // valid queries return an array with AT LEAST ONE VALUE
            // invalid queries return an EMPTY array (length 0)
            if (response.length !== 0) {
                // if block to be used when searching for default song 'the sign' by 'ace of base' AS PER HOMEWORK REQUIREMENTS
                // logic inside is to take entires from 'the sign' and filter out songs not by 'ace of base'
                if (obj.artist) {
                    response = response.filter((currentValue) => {
                        let found = false;
                        currentValue.album.artists.forEach((currentValue) => {
                            if (currentValue.name.toLowerCase() === obj.artist.toLowerCase()) {
                                found = true;
                            }
                        });
                        return found;
                    });
                }

                // Getting and Formatting relevant data using JSON.stringify
                var formattedResponse = JSON.stringify(
                    response.slice(0, limitForMultipleQueryResults).map((currentValue) => {
                        return {
                            // artists property can contain multiple artists in an array
                            // array is turned into a string for logging purposes
                            artists: currentValue.album.artists.map((currentValue) => {
                                return currentValue.name;
                            }).toString(),
                            album_url: currentValue.album.external_urls.spotify,
                            album_name: currentValue.album.name,
                            song_name: currentValue.name
                        }
                    }), null, 2);

                // STATE 1: song found (possible results)
                console.log('[ok] (max ' + limitForMultipleQueryResults + ') ' + formattedResponse);
                appendLine('[ok] (max ' + limitForMultipleQueryResults + ') ' + formattedResponse);
            } else {
                // STATE 2: song not found
                console.log('[ok] Spotify API: nothing found for [' + obj.searchTerm + ']');
                appendLine('[ok] Spotify API: nothing found for [' + obj.searchTerm + ']');
            }
        })
        // ERROR STATE: when none of the above states are met
        .catch((err) => {
            console.log('[error] Something went wrong at querySpotifyAPI()');
            appendLine('[error] Something went wrong at querySpotifyAPI()');
        }).finally(() => {
            // (# Helper A) this block of code is used ONLY for processing 'do-what-it-says'
            // it exists in the finally block because the script should attempt ALL API calls in randomFileArr even if one call fails
            doWhatItSaysHelper(obj.randomFileArr);
        });
}



// terminal details: node liri.js movie-this '<movie name here>'
// default search term: mr. nobody
// api url: 'https://www.omdbapi.com/?apikey=' + apiKey + '&t=' + movie
// info: title of movie |  year the movie came out | IMDB rating of movie | rotten tomatoes rating of the movie | country where movie was produced | language of movie | plot of the movie | actors in the movie
function queryOMDdAPI(obj) {
    console.log('\n\n>>>>>>>>>> movie-this [' + obj.searchTerm + '] >>>>>>>>>>');
    appendLine('>>>>>>>>>> movie-this [' + obj.searchTerm + '] >>>>>>>>>> run @ ' + new Date().toUTCString());
    // axios call result can have 2 variations:
    //// STATE 1: movie found -> will only return ONE value every time (Response property will be 'True')
    //// STATE 2: movie not found (Response property will be 'False')
    axios.get('https://www.omdbapi.com/?apikey=' + apiKeyOMDb + '&t=' + obj.searchTerm)
        .then((res) => {
            var response = res.data;
            // OMDb films that are not found return with 'true' 'false'. 
            // thus the string is compared
            if (response.Response.toLowerCase() !== 'false') {
                var formattedResponse = JSON.stringify({
                    title: response.Title,
                    year: response.Year,
                    rating_imdb: response.imdbRating,
                    // non-imdb ratings are stored in Ratings array
                    //// filter Ratings array and return as new array (will only have one element)
                    //// then access the Value property of the first array element
                    rating_rottentomatoes: response.Ratings.filter((currentValue) => {
                        return currentValue.Source === 'Rotten Tomatoes';
                    })[0].Value,
                    production_country: response.Country,
                    language: response.Language,
                    plot: response.Plot,
                    actors: response.Actors
                }, null, 2);
                // STATE 1: movie found
                console.log('[ok] ' + formattedResponse);
                appendLine('[ok] ' + formattedResponse);
            } else {
                // STATE 2: movie not found
                console.log('[ok] OMDb API: nothing found for [' + obj.searchTerm + ']');
                appendLine('[ok] OMDb API: nothing found for [' + obj.searchTerm + ']');
            }
        })
        .catch((err) => {
            // ERROR STATE: when none of the above states are met
            console.log('[error] Something went wrong at queryOMDbAPI()');
            appendLine('[error] Something went wrong at queryOMDbAPI()');
        }).finally(() => {
            // (# Helper A) this block of code is used ONLY for processing 'do-what-it-says'
            // it exists in the finally block because the script should attempt ALL API calls in randomFileArr even if one call fails
            doWhatItSaysHelper(obj.randomFileArr);
        });
}















// helper function for appending content to log.txt file
function appendLine(content = '\n') {
    fs.appendFile(logFilePath, content + '\n', (err) => {
        if (err) {
            return console.log(err);
        }
    });
}