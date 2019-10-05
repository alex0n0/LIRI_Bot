# LIRI Bot

LIRI Bot is a node cli tool to search for things of interest (movies, songs, concerts) and allows user input to determine which APIs to refer call.

The purpose of this exercise was to practice recursion, become familiar with node.js and useful pacakges like axiom, file system and inquirer. Another key learning was on working effectively within a development environment using .env files



## Project Structure

The main script (liri.js) exists in the root of the project.
Do not delete (assets > random.txt)
(assets > log.txt) will be generated when (liri.js) is run



## Instructions

**Screenshots on user inputs are provided in (assets) folder**

The first step is ensure Node.js is installed on your machine. Then install/update node modules and create a .env file where you are to add your API keys.

Go to the root of the project folder and enter the following command/s in the terminal to run LIRI Bot:

```
npm run liri OR node liri
```

![Image - Prompts](./assets/screenshots/step2_choose.png)

Follow the prompts that appear.

NOTE: Data validation prevents submission of empty inputs. You can enter [spaces] to test out fallback defaults.

![Image - Testing defaults](./assets/screenshots/step3_input_alt.png)

Results will be displayed in the terminal and also appended to log.txt which will be generated if it does not exist.

![Image - Results](./assets/screenshots/step4_result.png)


## Deployed Version

Deployed version does not exist. You will need to clone this repo and run (liri.js) using node.js



### Technologies Used

JavaScrpt. Node.js and Node Modules (axiom, node-spotify-api, inquirer, fs)

