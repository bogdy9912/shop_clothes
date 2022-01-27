const express = require("express");
const path = require("path");
const fs = require("fs"); // Or `import fs from "fs";` with ESM

const {Client} = require("pg");
const ip = require("ip");
const ejs = require("ejs");
const sass = require("sass");

const formidable = require('formidable');
const crypto = require("crypto");
const nodemailer= require('nodemailer');
const session= require('express-session');
const xmljs = require('xml-js');
const request = require('request');
const html_to_pdf = require('html-pdf-node');
var QRCode = require('qrcode');
const helmet=require('helmet');
const mysql = require("mysql");


console.dir(ip.address());
const app = express();
const port = process.env.PORT || 8080;






app.use(helmet.frameguard());//pentru a nu se deschide paginile site-ului in frame-uri

// app.use(express.bodyParser());

//pagini speciale pentru care cererile post nu se preiau cu formidable
app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));//obligatoriu de setat pt request body de tip json
//trec mai jos paginile cu cereri post pe care vreau sa le tratez cu req.body si nu cu formidable
app.use(["/contact"], express.urlencoded({extended:true}));

//crearea sesiunii (obiectul de tip request capata proprietatea session si putem folosi req.session)
app.use(session({
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));


var client; //folosit pentru conexiunea la baza de date
if(process.env.SITE_ONLINE){
    protocol="https://";
    numeDomeniu="limitless-taiga-65357.herokuapp.com"//atentie, acesta e domeniul pentru aplicatia mea; voi trebuie sa completati cu datele voastre
    client=new Client({
        user: 'nxldtoyrtruhgl',
        password:'95e254f6a4235e1b0534cfcba3649399db6e35b65789949a530d46268ed557b1',
        database:'d1sdt080v7p24k', host:'ec2-34-195-69-118.compute-1.amazonaws.com', port:5432,
        ssl: {
            rejectUnauthorized: false
        } });
}
else{
    client = new Client({
        user: 'bogdan',
        password: 'bogdan',
        database: 'simple_properties',
        host: 'localhost',
        port: 5432
    });
    protocol="http://";
    numeDomeniu="localhost:8080";
}


client.connect();

// app.use("/*", function(req,res,next){
//     res.locals.utilizator=req.session.utilizator;
//     //TO DO de adaugat vectorul de optiuni pentru meniu (sa se transmita pe toate paginile)
//     next();
// });

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




sirAlphaNum="";
v_intervale=[[48,57],[65,90],[97,122]];
for (let interval of v_intervale){
    for (let i=interval[0];i<=interval[1];i++)
        sirAlphaNum+=String.fromCharCode(i);
}
console.log(sirAlphaNum);



sirConsoane="qwrtypsdfghjklzxcvbnm";
function genereazaToken(lungime){
    sirAleator="";
    for(let i=0;i<lungime; i++){
        sirAleator+= sirConsoane[ Math.floor( Math.random()* sirConsoane.length) ];
    }
    return sirAleator
}



async function trimiteMail(username, email, token, token1){
    console.log("TOKEN1");
    console.log(token1);
    var transp= nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth:{//date login
            user:"test.tweb.node@gmail.com",
            pass:"tehniciweb"
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    //genereaza html
    d=new Date()
    sir_data=`${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

    await transp.sendMail({
        from:"test.tweb.node@gmail.com",
        to:email,
        subject:"Mesaj inregistrare",
        text:"Pe Simple properties ai username-ul "+username+"incepand de azi, "+ new Date(),
        html:`<h1>Salut!</h1><p style='color:blue'>Pe Simple Properties ai username-ul ${username} incepand de azi, 
<span style="color:purple; text-decoration: underline;">${sir_data}</span></p>
 <p><a href='http://${numeDomeniu}/confirmare_mail/${sir_data}/${username}/${token}'>Click aici pentru confirmare</a></p>`,
    })
    console.log("trimis mail");
}


app.get("/confirmare_mail/:token1/:user/:token", function(req,res){
    var queryUpdate=`update utilizatori set confirmat_mail=true where username = '${mysql.escape(req.params.user)}' and cod= '${mysql.escape(req.params.token)}' `;
    client.query(queryUpdate, function(err, rez){
        if (err){
            console.log(err);
            res.render("pagini/eroare",{err:"Eroare baza date",optiuni: v_optiuni});
            return;
        }
        if (rez.rowCount>0){
            res.render("pagini/confirmare",{optiuni: v_optiuni});
        }
        else{
            res.render("pagini/eroare",{err:"Eroare link",optiuni: v_optiuni});
        }
    });

});




parolaCriptiare="curs_tehnici_web";

// app.post("/inreg", function(req,res){
//    var formular = new formidable.IncomingForm();
//    formular.parse(req, function(err, campuriText, campuriFile){
//        console.log(campuriText);
//         var criptareParola = crypto.scryptSync(campuriText.parola, parolaCriptiare, 32).toString('ascii');
//
//         console.log(criptareParola);
//        var queryUtiliz = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat) values ('${campuriText.username}', '${campuriText.nume}', '${campuriText.prenume}', '${criptareParola}','${campuriText.email}', '${campuriText.culoareText}')`;
//                console.log(queryUtiliz);
//
//        client.query(queryUtiliz, function(err, rez){
//            if (err){
//                console.log(err);
//                res.render("pagini/inregistrare", {err:"Eroare baza date"});
//            }else{
//                if (rez.rows.length ==0){
//
//                }
//                res.render("pagini/inregistrare",{err:"", raspuns: "Date introduse"});
//            }
//        })
//    });
// });


function copyFile(src, dest) {

    let readStream = fs.createReadStream(src);

    readStream.once('error', (err) => {
        console.log(err);
    });

    readStream.once('end', () => {
        console.log('done copying');
    });

    readStream.pipe(fs.createWriteStream(dest));
}

app.post("/inreg", function(req, res){
    var formular= new formidable.IncomingForm();
    var username;
    formular.parse(req,function(err, campuriText, campuriFile){//4
        console.log(campuriText);
        console.log("Email: ", campuriText.email);
        //verificari - TO DO
        var eroare="";
        if (!campuriText.nume)
            eroare+="Numele nu poate fi necompletat. ";
        if (!campuriText.prenume)
            eroare+="Prenumele nu poate fi necompletat. ";
        if (!campuriText.username)
            eroare+="Username-ul nu poate fi necompletat. ";
        if (!campuriText.email)
            eroare+="Email-ul nu poate fi necompletat. ";
        //TO DO - de completat pentru restul de campuri required

        if ( !campuriText.username.match("^[a-zA-Z0-9]+$"))
            eroare+="Username-ul trebuie sa contina doar litere mici/mari si cifre. ";
        if ( !campuriText.parola.match("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]{2})(?=.*[.]).*$"))
            eroare+="Parola trebuie sa contina litere mari, mici, cel putin 2 nr, si un punct ";

        if ( !campuriText.parola === campuriText.rparola)
            eroare+="Cele 2 parole nu coincid";

        //TO DO - de completat pentru restul de campuri functia match
        if ( campuriText.parola.length<8)
            eroare+="Parola trebuie sa contina min 8 chr ";
        //TO DO - de completat pentru restul de campuri functia match

        if (eroare!==""){
            res.render("pagini/inregistrare",{err:eroare,optiuni: v_optiuni});
            return;
        }

        queryVerifUtiliz=` select * from utilizatori where username= '${campuriText.username}' `;
        console.log(queryVerifUtiliz)


        client.query(queryVerifUtiliz, function(err, rez){
            if (err){
                console.log(err);
                res.render("pagini/inregistrare",{err:"Eroare baza date",optiuni: v_optiuni});
            }

            else{
                if (rez.rows.length===0){
                    parolaCriptiare=campuriText.username;
                    var criptareParola=crypto.scryptSync(campuriText.parola,parolaCriptiare,32).toString('hex');
                    var token=genereazaToken(80);

                    folderUtilizator=path.join(__dirname, 'app', 'poze_uploadate', campuriText.username);


                    console.log("FILE");
                    console.log(campuriFile.poza);
                    fs.access(folderUtilizator, (err) => {
                        if(err)
                            fs.mkdirSync(folderUtilizator);

                        copyFile(campuriFile.poza.filepath, path.join(folderUtilizator, campuriFile.poza.newFilename+".jpg"));
                    });



                    var queryUtiliz=`insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod, problema_vedere, fotografie) values (${mysql.escape(campuriText.username)},${mysql.escape(campuriText.nume)},${mysql.escape(campuriText.prenume)}, $1 ,${mysql.escape(campuriText.email)},'${campuriText.culoareText}','${token}', '${(campuriText.probleme_vedere === "on")}' , '${campuriFile.poza.newFilename+".jpg"}')`;

                    console.log(queryUtiliz, criptareParola);
                    client.query(queryUtiliz, [criptareParola], function(err, rez){ //TO DO parametrizati restul de query
                        if (err){
                            console.log(err);
                            res.render("pagini/inregistrare",{err:"Eroare baza date",optiuni: v_optiuni});
                        }
                        else{
                             var token1="";

                            client.query(`select data_adaugare from utilizatori where username='${campuriText.username}'`,function(err, rezultat){
                                if(err) throw err;

                                token1 = rezultat.rows[0].data_adaugare;

                            trimiteMail(campuriText.username,campuriText.email, token, token1);

                            res.render("pagini/inregistrare",{err:"", raspuns:"Date introduse",optiuni: v_optiuni});
                            });
                        }
                    });
                }
                else{
                    eroare+="Username-ul mai exista. ";
                    res.render("pagini/inregistrare",{err:eroare,optiuni: v_optiuni});
                }
            }
        });
    });

});

app.post("/login", function(req, res){
    var formular= new formidable.IncomingForm();

    formular.parse(req,function(err, campuriText, campuriFile){
        console.log(campuriText);

        var querylogin=`select * from utilizatori where username= '${campuriText.username}' `;
        client.query(querylogin, function(err, rez){
            if(err){
                res.render("pagini/eroare",{optiuni: v_optiuni,mesaj:"Eroare baza date. Incercati mai tarziu."});
                return;
            }
            if (rez.rows.length!==1){//ar trebui sa fie 0
                res.render("pagini/eroare",{optiuni: v_optiuni,mesaj:"Username-ul nu exista."});
                return;
            }
            parolaCriptiare=campuriText.username;
            var criptareParola=crypto.scryptSync(campuriText.parola,parolaCriptiare,32).toString('hex');
            console.log(criptareParola);
            console.log(rez.rows[0].parola);
            console.log(rez.rows[0].confirmat_mail);
            if (criptareParola === rez.rows[0].parola && rez.rows[0].confirmat_mail){
                console.log("totul ok");
                req.session.mesajLogin=null;//resetez in caz ca s-a logat gresit ultima oara
                if(req.session){
                    req.session.utilizator={
                        id:rez.rows[0].id,
                        username:rez.rows[0].username,
                        nume:rez.rows[0].nume,
                        prenume:rez.rows[0].prenume,
                        culoare_chat:rez.rows[0].culoare_chat,
                        email:rez.rows[0].email,
                        rol:rez.rows[0].rol
                    }
                }
                console.log("ROL");
                console.log(rez.rows[0].rol);
                // res.render("pagini"+req.url);
                res.redirect(url="/index");
            }
            else{
                req.session.mesajLogin = "Login esuat";
                console.log("Login esuat")
                res.redirect(url="/index");
                //res.render("pagini/index",{ip:req.ip, imagini:obImagini.imagini, cale:obImagini.cale_galerie,mesajLogin:"Login esuat"});
            }

        });


    });
});



app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        res.render("pagini/eroare",{mesaj:"Nu sunteti logat.",optiuni: v_optiuni});
        return;
    }
    var formular= new formidable.IncomingForm();

    formular.parse(req,function(err, campuriText, campuriFile){
        console.log(err);
        console.log(campuriText);
        var criptareParola=crypto.scryptSync(campuriText.parola,parolaCriptare,32).toString('hex');

        //toti parametrii sunt cu ::text in query-ul parametrizat fiindca sunt stringuri (character varying) in tabel
        var queryUpdate=`update utilizatori set nume=$1::text, prenume=$2::text, email=$3::text, culoare_chat=$4::text where username= $5::text and parola=$6::text `;

        client.query(queryUpdate, [campuriText.nume, campuriText.prenume, campuriText.email, campuriText.culoareText, req.session.utilizator.username, criptareParola], function(err, rez){
            if(err){
                console.log(err);
                res.render("pagini/eroare",{optiuni: v_optiuni,mesaj:"Eroare baza date. Incercati mai tarziu."});
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount===0){
                res.render("pagini/profil",{optiuni: v_optiuni,mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }

            req.session.utilizator.nume=campuriText.nume;
            req.session.utilizator.prenume=campuriText.prenume;

            req.session.utilizator.culoare_chat=campuriText.culoareText;
            req.session.utilizator.email=campuriText.email;

            res.render("pagini/profil",{optiuni: v_optiuni,mesaj:"Update-ul s-a realizat cu succes."});

        });


    });
});


app.get("/logout",function(req,res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout",{optiuni: v_optiuni});
});


app.get('/useri', function(req, res){
    console.log(req.session.utilizator.rol);
    if( req.session && req.session.utilizator && req.session.utilizator.rol==="admin" ){
        client.query("select * from utilizatori",function(err, rezultat){
            if(err) throw err;
            //console.log(rezultat);
            res.render('pagini/useri',{optiuni: v_optiuni,useri:rezultat.rows});//afisez index-ul in acest caz
        });
    }
    else{
        res.status(403).render('pagini/eroare',{optiuni: v_optiuni,mesaj:"Nu aveti acces"});
    }

});


app.post("/sterge_utiliz",function(req, res){
    if( req.session && req.session.utilizator && req.session.utilizator.rol==="admin"  ){
        var formular= new formidable.IncomingForm()

        formular.parse(req, function(err, campuriText, campuriFisier){
            //var comanda=`delete from utilizatori where id=${campuriText.id_utiliz} and rol!='admin'`;
            var comanda=`delete from utilizatori where id=$1 and rol !='admin' and nume!= $2::text `;
            client.query(comanda, [campuriText.id_utiliz,"Mihai"],  function(err, rez){
                // TO DO mesaj cu stergerea
                if(err)
                    console.log(err);
                else{
                    if (rez.rowCount>0){
                        console.log("sters cu succes");
                    }
                    else{
                        console.log("stergere esuata");
                    }
                }
            });
        });
    }
    res.redirect("/useri",{optiuni: v_optiuni});

});


caleXMLMesaje="resurse/xml/contact.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlContactDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}


function parseazaMesaje(){
    let existaInainte=creeazaXMlContactDacaNuExista();
    let mesajeXml=[];
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});


        let elementMesaje=obJson.elements[0].elements.find(function(el){
            return el.name==="mesaje"
        });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name==="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name==="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}


app.get("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    res.render("pagini/contact",{ optiuni: v_optiuni,utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    let u= req.session.utilizator?req.session.utilizator.username:"anonim";
    let mesajNou={
        type:"element",
        name:"mesaj",
        attributes:{
            username:u,
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/contact.xml",sirXml);

    res.render("pagini/contact",{optiuni: v_optiuni, utilizator:req.session.utilizator, mesaje:elementMesaje.elements})
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

    // let id = 1;

    let conditie = "";
    if (req.query.id) {
        conditie = `id='${req.query.id}'`;
    }

    client.query(`select * from products2 where 1=1 and ${conditie}`, function (err, rez) {

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
        res.render('pagini/forbidden',{optiuni: v_optiuni});
        res.status = 403;
    }
    if (fs.existsSync(`${__dirname}/views/pagini/${pagina}.ejs`)) {
        // Do something

        res.render(`pagini/${pagina}`, {optiuni:v_optiuni,});
    }
    res.status = 404;
    res.render('pagini/not_found',{optiuni: v_optiuni});
});

//
// var client=new Client({ user: 'bogdan', password:'bogdan',database:'simple_properties', host:'localhost', port:5432,  ssl: {
//         rejectUnauthorized: false
//     } });

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


var s_port= process.env.PORT || 8080;
app.listen(s_port);
// app.listen(port, () => {
// });