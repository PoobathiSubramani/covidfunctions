const mongoose = require("mongoose");
const dbConnectionString = `mongodb+srv://${process.env.dbUser}:${process.env.dbPwd}@${process.env.dbCluster}/${process.env.dbName}`;
const dbOpts = {useNewUrlParser: true, useUnifiedTopology: true}


const schemaCovid19Data = mongoose.Schema([{
    databatch: Number,
    entryid: Number,
    date: String,
    statecode: String,
    district: String,
    city: String,
	currentstatus: String,
	cases: Number
}])


module.exports = async function (context, req) {
    
    context.log('JavaScript HTTP trigger function processed a request.');

        
    await mongoose.connect(dbConnectionString, dbOpts)
        .then(()=>{
            context.log('connected to db');
        })
        .catch((err)=>{
            context.log('connection to db is not successful. ', err);
        });
    

    var filterStateSummary = {statecode: 'TN'}
    var stateSummaryQuery = [{$match: filterStateSummary}, {$group: {'_id': {status: "$currentstatus"}, cases: {'$sum': "$cases"}}}]
    const covid19Collections = mongoose.model("covid19datacollection", schemaCovid19Data)
    const StateSummaryPromise = await dashboardData(covid19Collections, stateSummaryQuery);
    const StateSummaryUnformatted = await Promise.all(StateSummaryPromise); 
    context.log('db results: ', StateSummaryUnformatted);
    
    context.res = {body: JSON.stringify(StateSummaryUnformatted)}
    
}

    

async function dashboardData(schema, query) {
    return new Promise((resolve, reject) => {
      schema.aggregate(query).exec((err, result) => {
        if(!err) {
          resolve(result);
        } else {
          reject(err);
        }
      })
    })
  }    
