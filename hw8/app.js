const http = require("http");
const fs = require("fs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Enter the path to the HTML template file: ", (htmlFile) => {
  fs.access(htmlFile, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File ${htmlFile} does not exist`);
      readline.close();
      return;
    }

    readline.question("Enter the path to the JSON data file: ", (dataFile) => {
      fs.access(dataFile, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`Data file ${dataFile} does not exist`);
          readline.close();
          return;
        }

        const server = http.createServer((req, res) => {
          fs.readFile(htmlFile, "utf8", (err, htmlTemplate) => {
            if (err) {
              res.end(`Error with HTML template file: ${err.message}`);
              return;
            }

            fs.readFile(dataFile, "utf8", (err, data) => {
              if (err) {
                res.end(`Error with data file: ${err.message}`);
                return;
              }

              try {
                data = JSON.parse(data);
              } catch (err) {
                res.end(`Error with JSON data: ${err.message}`);
                return;
              }

              let dataString = "";
              for (let dataKey in data) {
                if (dataKey === "id" && data[dataKey] !== 1)
                  dataString += "<li>";
                else dataString += "</li><li>";
                if (typeof data[dataKey] === "object") {
                  for (let nestedKey in data[dataKey]) {
                    dataString += `<span>${nestedKey}: ${data[dataKey][nestedKey]}</span><br>`;
                  }
                } else {
                  dataString += `<span>${dataKey}: ${data[dataKey]}</span><br>`;
                }
              }
              dataString += "</li>";

              htmlTemplate = htmlTemplate.replace("{{example}}", dataString);

              res.end(htmlTemplate);
            });
          });
        });

        server.listen(3000, () => {
          console.log("Server running at http://localhost:3000");
        });

        readline.close();
      });
    });
  });
});
