const express = require("express");
const path = require("path");
const fs = require("fs"); // Or `import fs from "fs";` with ESM

const {Client} = require("pg");
const ip = require("ip");

console.dir(ip.address());
const app = express();
const port = process.env.PORT || 8080;

var client=new Client({ user: 'bogdan', password:'bogdan', database:'simple_properties', host:'localhost', port:5432 });

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app')));
app.set('views', path.join(__dirname, '/views'));

app.get(['/', "/index", "/home"], (req, res) => {

    var buf = fs.readFileSync(__dirname+"/app/assets/galerie.json").toString("utf-8");
    let obImagini = JSON.parse(buf);
    console.log(obImagini.imagini);
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let finalImg = [];
    for (img of obImagini.imagini){
        if (img.luni.includes(months[date.getMonth()])){
            finalImg.push(img);
        }
    }
    console.log(finalImg);
    console.log(date.getMonth());

    res.render('pagini/index', {imagini: finalImg, cale: "assets"+obImagini.caleGalerie});
});


app.get("*/galerie-animata.css", function(req,res) {
    res.setHeader("Content-Type", "text/css");
    let sirScss = fs.readFileSync("./app/css/galerie_animata.scss").toString("utf-8");
    let rezScss = ejs.render(sirScss,{});
    fs.writeFileSync("./temp/galerie-animata.scss", rezScss);
    let cale_css=path.join(__dirname, "temp", "galerie-animata.css");
    let cale_scss=path.join(__dirname, "temp", "galerie-animata.scss");
    sass.render({file: cale_scss, sourceMap: true}, function(err, rezCompilare){
        if (err){
            res.end();
            return;
        }
        fs.writeFileSync(cale_css, rezCompilare.css, function(err){

        });
        res.sendFile(cale_css);
    });

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