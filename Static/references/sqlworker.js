const {workerData, parentPort}= require('worker_threads');
const mysql= require('my-sql');

const conn= mysql.createConnection(
    { 
         host     : 'localhost',
         user     : 'travelbuddyuser',
         password : '', 
         database : 'travelbuddydb'
     }
 )
 
conn.connect((err)=>{
    
     if(err) {
         process.exit(110)
     };
  })

conn.query(workerData.query,workerData.values, (err, results, fields)=>{
    conn.end();
    if(err){
        console.log(err)
        process.exit(111);
        
    }
    else{
        parentPort.postMessage(results);
        process.exit(0);
    }
})
