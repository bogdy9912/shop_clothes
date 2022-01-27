 window.onload= function(){
    var formular=document.getElementById("form_inreg");
    if(formular){
    formular.onsubmit= function(){

        // if(!document.getElementById("parl").value.match("^[A-Z]+[a-z]+[0-9]{2}.+$")){
        let parola = document.getElementById("parl").value;
        let inp_username = document.getElementById("inp-username").value;
        let inp_nume = document.getElementById("inp-nume").value;
        let inp_prenume = document.getElementById("inp-prenume").value;
        let inp_email = document.getElementById("inp-email").value;

        if (!inp_email.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )){
            alert("Email-ul nu este valid");
            return false;
        }

        if(!(parola.match("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]{2})(?=.*[.]).*$"))){
            alert("Parola trebuie sa contina litere mari, mici, cel putin 2 nr, si un punct");
            return false;
        }
        if(document.getElementById("parl").value!==document.getElementById("rparl").value){
            alert("Nu ati introdus acelasi sir pentru campurile \"parola\" si \"reintroducere parola\".");
            return false;
        }



            return true;
        }
    }
 }