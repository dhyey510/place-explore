const axios = require("axios");
const HttpError = require("../models/http-error");

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=8524b4e626cb45eeaf93a90174dc0250`
  );

  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Couldn't find location for specific address",
      422
    );
    throw error;
  }

  console.log(data);
  const coordinates = data.results[0].geometry;

  return coordinates;
}

module.exports = getCoordsForAddress;
