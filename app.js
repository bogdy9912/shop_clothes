const express = require("express");
const path = require("path");
const fs = require("fs"); // Or `import fs from "fs";` with ESM
const sharp = require('sharp');
const {Client} = require("pg");
const ip = require("ip");
const ejs = require("ejs");
const sass = require("sass");

console.dir(ip.address());
const app = express();
const port = process.env.PORT || 8080;

var client = new Client({
    user: 'bogdan',
    password: 'bogdan',
    database: 'simple_properties',
    host: 'localhost',
    port: 5432
});


var v_optiuni = [];
client.query("select * from unnest(enum_range(null::tipuri_produse))", function(errCateg, rezCateg){

    for(let elem of rezCateg.rows){
        v_optiuni.push(elem.unnest);
    }
    console.log(v_optiuni);

})
// client.query("select * from products2", function(err, rez){
//     console.log("this is query");
//     console.log(rez.rows);
// });

client.connect();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app')));
app.set('views', path.join(__dirname, '/views'));

app.get(['/', "/index", "/home"], (req, res) => {

    var buf = fs.readFileSync(__dirname + "/app/assets/galerie.json").toString("utf-8");
    let obImagini = JSON.parse(buf);
    console.log(obImagini.imagini);
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let finalImg = [];
    for (img of obImagini.imagini) {
        if (img.luni.includes(months[date.getMonth()])) {
            if (finalImg.length < 12) {
                finalImg.push(img);
            }
        }
    }
    console.log(finalImg);
    console.log(date.getMonth());

    res.render('pagini/index', {
        ip: req.ip,
        imagini: finalImg,
        cale: "assets" + obImagini.caleGalerie,
        allImagini: obImagini.imagini.sort((a, b) => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * (11 - 5 + 1) + 5)),
        optiuni: v_optiuni
    });

});


app.get("*/galerie-animata.css", function (req, res) {
    console.log("PAPIU");
    res.setHeader("Content-Type", "text/css");
    let sirScss = fs.readFileSync("./app/css/galerie_animata.scss").toString("utf-8");
    let rezScss = ejs.render(sirScss, {});
    fs.writeFileSync("./temp/galerie-animata.scss", rezScss);
    let cale_css = path.join(__dirname, "temp", "galerie-animata.css");
    let cale_scss = path.join(__dirname, "temp", "galerie-animata.scss");
    sass.render({file: cale_scss, sourceMap: true}, function (err, rezCompilare) {
        if (err) {
            console.log(err);
            console.log("EROARE PE SCSS");
            res.end();
            return;
        }
        console.log("TERCE LA CSS");
        fs.writeFileSync(cale_css, rezCompilare.css, function (err) {
            console.log("EROARE PE CSS");
        });
        res.sendFile(cale_css);
    });

});
//
// app.get('/produse', function (req, res) {
//     let conditie = "";
//     // if ("tip" in req.query) {
//     //     conditie = ` and tip_produs='${req.query.tip}'`;
//     // }
//     client.query(`select * from products where 1=1 ${conditie}`, function (err, rez) {
//         if (!err) {
//             console.log(rez);
//
//             v_optiuni = [];
//             for (let elem of rezCateg.rows) {
//                 v_optiuni.push(elem.unnest);
//             }
//             res.render('pagini/produse', {produse: rez.rows, optioni: v_optiuni});
//         } else {
//         }
//     });
// })


app.get('/produs', function (req, res) {

    let id = 1;

    // let conditie = "";
    // if ("tip" in req.query) {
    //     conditie = ` and tip_produs='${req.query.tip}'`;
    // }

    client.query(`select * from products2 where  id=${id}`, function (err, rez) {

        if (!err) {
            console.log(rez);
            if (rez.rows) {
                res.render('pagini/produs', {prod: rez.rows[0],optiuni:v_optiuni});
            }

        } else {
        }
    });

})
// app.get('/index', (req, res) => {
//
//     res.render('pagini/index');
// });

app.get("/produse", function(req, res){
    console.log(req.query)
    var conditie=""
    if(req.query.tip)
        conditie+=` and tip_produs='${req.query.tip}'`;
    client.query(`select * from products2 where 1=1 ${conditie}`, function(err,rez){
        console.log(err)
        if (!err){
            console.log(rez);
            client.query("select * from unnest(enum_range(null::categ_properties))", function(errCateg, rezCateg){
                console.log(rezCateg);
                optiuni_mici=[];
                for(let elem of rezCateg.rows){
                    optiuni_mici.push(elem.unnest);
                }
                console.log(optiuni_mici);
                res.render("pagini/produse",{produse:rez.rows,optiuni:v_optiuni, optiuni_mici:optiuni_mici});
            })

        }
        else{//TO DO curs
        }
    })
})

app.get('/:pagina', (req, res) => {
    const {pagina} = req.params;
    console.log(pagina);


    if (pagina.includes('.ejs')) {
        res.render('pagini/forbidden');
        res.status = 403;
    }
    if (fs.existsSync(`${__dirname}/views/pagini/${pagina}.ejs`)) {
        // Do something

        res.render(`pagini/${pagina}`, {optiuni:v_optiuni,});
    }
    res.status = 404;
    res.render('pagini/not_found');
});

//
// var client=new Client({ user: 'bogdan', password:'bogdan',database:'simple_properties', host:'localhost', port:5432,  ssl: {
//         rejectUnauthorized: false
//     } });
/*var client=new Client({
    user: 'cyshaohbdkflix',
    password:'b8c463fcc4de964e38a065008bc6f9532ec55e59dd22bed4fdb7540c4075642f',
    database:'d3odd5eht8vd3s', host:'ec2-35-153-4-187.compute-1.amazonaws.com', port:5432,
    ssl: {
        rejectUnauthorized: false
      } });*/
// client.connect();



// app.use("/resurse",express.static(__dirname+"/app"));

//
//
// app.get("/produs/:id", function(req, res){
//     console.log(req.params)
//     client.query(`select * from prajituri where id=${req.params.id}`, function(err,rez){
//         if (!err){
//             console.log(rez);
//             res.render("pagini/produs",{prod:rez.rows[0]});
//         }
//         else{//TO DO curs
//         }
//     })
// })


app.listen(port, () => {
});