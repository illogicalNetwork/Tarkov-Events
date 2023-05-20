const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.escapefromtarkov.com/openmap';

const fetchData = () => {
  axios.get(url)
    .then(response => {
      let html = response.data;
      let $ = cheerio.load(html);

      // Extract PMC / SCAV kills and strip spaces
      let killsText = $('.info .item .text').first().text();
      let killsCount = $('.info .item .count').first().text().trim();

      // Extract next map and strip "Next map:"
      let nextMap = $('.next').text().replace('Next map:', '').trim();

      let data = {
        timestamp: new Date(),
        kills: {
          text: killsText,
          count: killsCount
        },
        nextMap: nextMap
      };

      // Append to JSON file
      fs.readFile('data2.json', (err, fileData) => {
        if (err) throw err;

        let json = JSON.parse(fileData);
        json.push(data);

        fs.writeFile('data2.json', JSON.stringify(json, null, 2), (err) => {
          if (err) throw err;
          console.log('Data written to file');
        });
      });
    })
    .catch(console.error);
}

// Run the function immediately, then every 60 seconds
fetchData();
setInterval(fetchData, 60 * 1000);
