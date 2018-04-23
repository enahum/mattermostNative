// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

var rowTemplate = `[ '{name}', new Date({startTime}), new Date({endTime}) ]`;
var template = (
    `<html>
  <head>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script type="text/javascript">
      google.charts.load('current', {'packages':['timeline']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var container = document.getElementById('timeline');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'President' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });
        dataTable.addRows([
          {rows}]);

        chart.draw(dataTable);
      }
    </script>
  </head>
  <body>
    <div id="timeline" style="height: 1000px;"></div>
  </body>
</html>`);

app.use(bodyParser.json());

function getTimestamp() {
    const now = new Date();
    return now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "::" + now.getMilliseconds();
}

function visualize(data) {
    let rows = [];

    for (i in data) {
        const row = data[i];
        if (row.name) {
            let newRow = rowTemplate;
            newRow = newRow.replace('{name}', row.name);
            newRow = newRow.replace('{startTime}', row.startTime);
            newRow = newRow.replace('{endTime}', row.endTime);

            rows.push(newRow);
        }
    }


    const newTemplate = template.replace('{rows}', rows.join(',\n\t\t'));
    // const name = 'cold-start-' + getTimestamp() + '.html';
    const name = 'cold-start.html';
    fs.writeFile("./tmp/metrics/" + name, newTemplate, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

app.post('/', function (req, res) {
    const msg = req.body.message;
    const data = req.body.data;
    console.log(getTimestamp() + ": \n");
    console.log("message: " + msg);
    console.log("data: \n" + JSON.stringify(data, null, 4));
    console.log('---------------------');
    res.send();

    if (msg ===  'metrics') {
        visualize(data);
    }
});

app.listen(5001);