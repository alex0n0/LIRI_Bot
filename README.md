# LIRI Bot

LIRI Bot is a Node CLI application that allows you to search for things of interest (movies, songs, concerts) and accepts user input to determine which APIs to call.

The purpose of this exercise was to practice recursion, become familiar with node.js and useful pacakges like axiom, file system and inquirer. Another key learning was on working effectively within a development environment using .env files

## Features

- CLI application
- Recursive functions
- Printing search results to a file

## Getting Started

Begin by cloning the [LIRI_Bot](https://github.com/alex0n0/LIRI_Bot) repository and install dependencies:

```terminal
git clone https://github.com/alex0n0/LIRI_Bot.git
npm install
```

Create a **.env** file and add your database credentials:

```javascript
SPOTIFY_ID=your_spotify_id
SPOTIFY_SECRET=your_spotify_secret
OMDB_KEY=your_omdb_key
BANDS_IN_TOWN_KEY=your_bands_in_town_key
```

Run the application to see it in action:

```terminal
npm run liri
NOTE: Do not delete (assets > random.txt)
NOTE: (assets > log.txt) will be generated when (liri.js) is run
```

![Image - Prompts](./assets/screenshots/step2_choose.png)

Follow the prompts that appear.

NOTE: Data validation prevents submission of empty inputs. You can enter [spaces] to test out fallback defaults.

![Image - Testing defaults](./assets/screenshots/step3_input_alt.png)

Results will be displayed in the terminal and also appended to log.txt which will be generated if it does not exist.

![Image - Results](./assets/screenshots/step4_result.png)

## Built With

Node.js

Node Packages

- Axios
- Filesystem
- Inquirer
- Node-spotify-api
- Dotenv

## License

This project is licensed under the terms of the [MIT](https://github.com/alex0n0/LIRI_Bot/blob/master/LICENSE) license.
