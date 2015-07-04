/**
 * Created by svenc on 03/07/15.
 */
db.papers.find().forEach( function(obj) {
    // if (obj.DATE != undefined) { //check if is not already a ISODate

    obj.DATE = new ISODate(obj.DATE); // convert in ISODate
    db.papers.save(obj); //save and thats all
    //  }
});


mongoimport --db ecloud --collection papers --drop --file /Users/svenc/OneDrive/development/ecloud_papers/scripts/leuven.json --jsonArray --type json