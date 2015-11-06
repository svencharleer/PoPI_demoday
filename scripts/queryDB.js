/**
 * Created by svenc on 16/09/15.
 */
var d = require("../classes/db.js")

/*
d.getStacks(function(e,d){
    var total = 0;
    d.forEach(function(s){

        var stack = JSON.parse(s.Stack)
        //console.log(stack);
        var found = false;
        stack.forEach(function(ss){
            if(found) return;
            if(ss.year != undefined )
            {
                var year = false;
                ss.year.forEach(function(y){
                    if(y[0] == 1861 &&
                        y[1] == 1886)
                        year = true;
                })
                var country = (ss.language != undefined && ss.language.length == 1
                    && ss.language[0] == 'ger');
                if(country && year){
                    console.log(stack.length);
                    console.log(s.Timestamp)
                    //if(stack.length == 103) console.log(stack);
                    //console.log(ss.language.length);
                    total++;
                    found = true;
                }

            }

            //console.log(ss.year)
        })
    })
    console.log("total " + total);



})*/


d.getStacks(function(e,d){
    var total = 0;
    d.forEach(function(s) {

        var st = JSON.parse(s.Stack)
        //console.log(stack);
        var found = false;
        //console.log(stack.length);

        //q1:
        st.forEach(function(stack,i){
            if(found) return;
            var lang1 = false;
            var lang2 = false;
            var year1 = false;
            var year2 = false;
            var title1 = false;
            var title2 = false;
            if (stack.language != undefined && stack.language[0] != undefined && stack.language[0] == "est")
            {
                lang1 = true;
            }
            if (stack.language != undefined && stack.language[0] != undefined && stack.language[0] == "ger")
            {
                lang2 = true;
            }
            if(stack.title != undefined && stack.title.indexOf("Postimees") >= 0)
                title1 = true;
            if(stack.title != undefined && stack.title.indexOf("Hamburger Nachrichten") >= 0)
                title2 = true;

            if(stack.year != undefined)
                stack.year.forEach(function(y){
                    if(y[0] >= 1880 && y[0] <= 1880 &&
                        y[1] <= 1925 && y[1] >= 1925 )
                        year1 = true;
                });

            if(stack.year != undefined)
                stack.year.forEach(function(y){
                    if(y[0] >= 1861-5 && y[0] <= 1861+5 &&
                        y[1] <= 1886+5 && y[1] >= 1886-5)
                        year2 = true;
                });

            if(lang2){

                // console.log("------------")
                // console.log("q1");
                var str = JSON.stringify(st[i])
                    + "\t" + (st[i+1]!= undefined ? JSON.stringify(st[i+1]): "X")
                    + "\t" + (st[i+2]!= undefined ? JSON.stringify(st[i+2]) : "X")
                    + "\t" +(st[i+3]!= undefined ? JSON.stringify(st[i+3]) : "X");
                    console.log(s.Timestamp + "\t" + st.length + "\t"+ i + "\t" + str);
                total++;
                found = true;;

            }
        })


        return;
        if(lang2){

            // console.log("------------")
            // console.log("q1");
            console.log(s.Timestamp + "," + st.length + ",q6")


        }
        else if(!lang1 && !lang2 && year){

            // console.log("------------")
            // console.log("q1");
            console.log(s.Timestamp + "," + st.length + ",q2")

        }
        else{
            console.log(s.Timestamp + "," + st.length + ",q" + "," + JSON.stringify(stack).replace(",",";") )
        }

        return;
        /* stack.forEach(function(ss){
         if(found) return;
         if(ss.year != undefined )
         {
         var year = false;
         ss.year.forEach(function(y){
         if(y[0] == 1861 &&
         y[1] == 1886)
         year = true;
         })
         var country = (ss.language != undefined && ss.language.length == 1
         && ss.language[0] == 'ger');
         if(country && year){
         console.log(stack.length);
         console.log(s.Timestamp)
         //if(stack.length == 103) console.log(stack);
         //console.log(ss.language.length);
         total++;
         found = true;
         }

         }

         //console.log(ss.year)
         })

         })
         */
    });
    console.log("total " + total);
    //console.log("total " + total);




})

/*db.getCollection('stacklogs').find().forEach(function(d){
    var s = JSON.toJSON(d.Stack);
    print(s.length);
    //d.Stack.forEach(function(f){
    //	print(f.length)
    //})
})*/