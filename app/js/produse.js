window.onload= function(){


    var btn=document.getElementById("filtrare");
    btn.onclick=function(){
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){

            art.style.display="none";

            /*
            v=art.getElementsByClassName("nume")
            nume=v[0]*/
            var nume=art.getElementsByClassName("val-nume")[0];//<span class="val-nume">aa</span>
            var descriere=art.getElementsByClassName("val-descriere")[0];//<span class="val-nume">aa</span>
            console.log(nume.innerHTML)
            var myRe = /[0-9]/g;
            var text = document.getElementById("inp-nume").value;
            var invalidText = myRe.exec(text);
            if (invalidText){
                alert('invalid text');
                document.getElementById("inp-nume").value = '';

            }
            var conditie1=nume.innerHTML.startsWith(document.getElementById("inp-nume").value)
            var conditie9=descriere.innerHTML.includes(document.getElementById("inp-description").value)


            var pret=art.getElementsByClassName("val-pret")[0]
            var conditie2=parseInt(pret.innerHTML) > parseInt(document.getElementById("inp-pret").value);

            var radbtns=document.getElementsByName("gr_rad");
            for (let rad of radbtns){
                if (rad.checked){
                    var valCalorii=rad.value;//poate fi 1, 2 sau 3
                    break;
                }
            }

            var caloriiArt= parseInt(art.getElementsByClassName("val-garantie")[0].innerHTML);
            var conditie3=false;
            switch (valCalorii){
                case "1": conditie3= (caloriiArt<5); break;
                case "2": conditie3= (caloriiArt>=5 && caloriiArt<10); break;
                case "3": conditie3= (caloriiArt>=10); break;
                default: conditie3=true;

            }
            console.log(conditie3);

            var selCateg=document.getElementById("inp-categorie");
            var conditie4= (art.getElementsByClassName("val-categorie")[0].innerHTML == selCateg.value ||  selCateg.value=="toate");
            var valEtaj = [];
            var checkbtns=document.getElementsByName("gr_check");
            var etajArt= parseInt(art.getElementsByClassName("val-etaj")[0].innerHTML);
            var conditie5=false;
            var conditie6=false;
            var conditie7=false;
            var conditie8=false;
            for (let check of checkbtns){
                if (check.checked){
                    console.log(check.value);
                    valEtaj = [...valEtaj, check.value];
                    //poate fi 1, 2 sau 3


                }
            }


            for (let i of valEtaj){
                switch(i){
                    case "1": conditie5= (etajArt === 1); console.log("case 1");break;
                    case "2": conditie6= (etajArt>1 && etajArt<10); console.log("case 2");break;
                    case "3": conditie7= (etajArt>=10 && etajArt<60); console.log("case 3");break;
                    case "4": conditie8= (etajArt>=60); console.log("case 4");break;
                }
            }
            // switch(check.value){
            //     case "1": conditie5= (etajArt === 1); console.log("case 1");break;
            //     case "2": conditie5= (etajArt>1 && etajArt<10); console.log("case 2");break;
            //     case "3": conditie5= (etajArt>=10 && etajArt<60); console.log("case 3");break;
            //     case "4": conditie5= (etajArt>=600); console.log("case 4");break;
            //     default: conditie5=true;
            //         break;
            // }

            if(conditie1 && conditie9 && conditie2 && conditie3 && conditie4 &&( conditie5 ||conditie6 ||conditie7 ||conditie8))
                art.style.display="block";
            
        }
    }
    var rng=document.getElementById("inp-pret");
    rng.onchange=function(){
        var info = document.getElementById("infoRange");//returneaza null daca nu gaseste elementul
        if(!info){
            info=document.createElement("span");
            info.id="infoRange"
            this.parentNode.appendChild(info);
        }
        
        info.innerHTML="("+this.value+")";
    }



    function sorteaza(semn){
        var articole=document.getElementsByClassName("produs");
        var v_articole=Array.from(articole);
        v_articole.sort(function(a,b){
            var nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
            var nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
            if(nume_a!=nume_b){
                return semn*nume_a.localeCompare(nume_b);
            }
            else{
                
                var pret_a=parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
                var pret_b=parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
                return semn*(pret_a-pret_b);
            }
        });
        for(let art of v_articole){
            art.parentNode.appendChild(art);
        }
    }

    var btn2=document.getElementById("sortCrescNume");
    btn2.onclick=function(){
        
        sorteaza(1)
    }

    var btn3=document.getElementById("sortDescrescNume");
    btn3.onclick=function(){
        sorteaza(-1)
    }


    document.getElementById("resetare").onclick=function(){
        //resetare inputuri
        document.getElementById("i_rad4").checked=true;
        document.getElementById("i_check1").checked=true;
        document.getElementById("i_check2").checked=true;
        document.getElementById("i_check3").checked=true;
        document.getElementById("i_check4").checked=true;
        document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
        document.getElementById("infoRange").innerHTML="("+document.getElementById("inp-pret").min+")";

        //de completat...


        //resetare articole
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){

            art.style.display="block";
        }
    }
 }


 window.onkeydown=function(e){
    console.log(e);
    if(e.key=="c" && e.altKey==true){
        var suma=0;
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){
            if(art.style.display!="none")
                suma+=parseFloat(art.getElementsByClassName("val-pret")[0].innerHTML);
        }

        var spanSuma;
        spanSuma=document.getElementById("numar-suma");
        if(!spanSuma){
            spanSuma=document.createElement("span");
            spanSuma.innerHTML=" Suma:"+suma;//<span> Suma:...
            spanSuma.id="numar-suma";//<span id="..."
            document.getElementById("p-suma").appendChild(spanSuma);
            setTimeout(function(){document.getElementById("numar-suma").remove()}, 1500);
        }
    }
 }