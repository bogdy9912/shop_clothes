const express = require("express");
const path = require("path");
const fs = require("fs"); // Or `import fs from "fs";` with ESM

const ip = require("ip");
console.dir(ip.address());
const app = express();

const port = 8080;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app')));
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {

    res.render('pagini/index');
});

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