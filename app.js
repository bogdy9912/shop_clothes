const express = require("express");
const path = require("path");
const fs = require("fs"); // Or `import fs from "fs";` with ESM

const {Client} = require("pg");
const ip = require("ip");
console.dir(ip.address());
const app = express();

const port = 8080;

var client=new Client({ user: 'bogdan', password:'bogdan', database:'simple_properties', host:'localhost', port:5432 });

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app')));
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {

    res.render('pagini/index');
});




app.get('/produse', function (req, res) {
    let conditie = "";
    if ("tip" in req.query){
        conditie=` and tip_produs='${req.query.tip}'`;
    }
    client.query(`select * from products where 1=1 ${conditie}`, function (err, rez){
        if (!err){
            console.log(rez);
            // res.render();
        }else{}
    });
})
app.get('/produs/:id', function (req, res) {
    let {id} = req.param();
    let conditie = "";
    if ("tip" in req.query){
        conditie=` and tip_produs='${req.query.tip}'`;
    }
    client.query(`select * from products where  id=${id}`, function (err, rez){
        if (!err){
            console.log(rez);
            if (rez.rows){
            // res.render('pagini/produs', {prod:rez.row[0]});
            }
            //res.render('eroooare');
        }else{}
    });
})
// app.get('/index', (req, res) => {
//
//     res.render('pagini/index');
// });

app.get('/:pagina', (req, res) => {
    const {pagina} = req.params;
    console.log(pagina);


    if (pagina.includes('.ejs')) {
        res.render('pagini/forbidden');
        res.status = 403;
    }
    if (fs.existsSync(`${__dirname}/views/pagini/${pagina}.ejs`)) {
        // Do something

        res.render(`pagini/${pagina}`);
    }
    res.status = 404;
    res.render('pagini/not_found');
});


app.listen(port, () => {
});