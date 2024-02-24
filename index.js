const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const url = "https://en.wikipedia.org/wiki/List_of_fishes_of_Florida";

axios
  .get(url)
  .then((response) => {
    const $ = cheerio.load(response.data);
    const table = $(".wikitable.sortable");
    const rows = $("tr", table);
    const data = [];

    rows.each((i, row) => {
      if (i === 0) return; // Skip the header row
      const cells = $("td", row);
      const commonName = $(cells[0]).text().trim();
      const scientificName = $(cells[1]).text().trim();
      let imageUrl = $(cells[2]).find("img").attr("src");
      if (imageUrl) {
        imageUrl = "https:" + imageUrl;
      }
      const freshwater =
        $(cells[5]).find('img[alt="check"]').length > 0 ? "Yes" : "No";
      const saltwater =
        $(cells[6]).find('img[alt="check"]').length > 0 ? "Yes" : "No";
      data.push([commonName, scientificName, imageUrl, freshwater, saltwater]);
    });

    const csvContent =
      "Common Name,Scientific Name,Image URL,Freshwater,Saltwater\n" +
      data.map((row) => row.join(",")).join("\n");
    fs.writeFileSync("florida_fishes.csv", csvContent);
  })
  .catch((error) => {
    console.error("Error fetching the page:", error);
  });
