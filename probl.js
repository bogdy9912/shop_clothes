const express = require("express");
const path = require("path");
const fs = require("fs"); // Or `import fs from "fs";` with ESM

const {Client} = require("pg");

const ejs = require("ejs");

const formidable = require('formidable');

const app = express();
const port = 8080;


var client = new Client({
    user: 'bogdan',
    password: 'bogdan',
    database: 'simple_properties',
    host: 'localhost',
    port: 5432
});
protocol="http://";
numeDomeniu="localhost:8080";


client.connect();


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app')));
app.set('views', path.join(__dirname, '/views'));



app.get("/reviste", function(req, res){
    var query=`select * from reviste `;
    client.query(query, function(err, rez){
        if(err){
            console.log(err);
            return;
        }
        console.log(rez.rowCount);
        res.render("pagini/reviste",{reviste: rez.rows});
        });
    });


app.listen(port);