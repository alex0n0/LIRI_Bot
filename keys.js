const env = require('dotenv').config();

exports.keys = {
  spotify_id: process.env.SPOTIFY_ID,
  spotify_secret: process.env.SPOTIFY_SECRET,
  omdb_key: process.env.OMDB_KEY,
  bands_in_town_key: process.env.BANDS_IN_TOWN_KEY
};
