const mysql= require('mysql');

function sqlQuery(query, values){
    return new Promise((resolve,reject)=>{
        const conn= mysql.createConnection(
            { 
                 host     : 'localhost',
                 user     : 'travelbuddyuser',
                 password : '', 
                 database : 'database_travelbuddy'
             }
         )
         
        conn.connect((err)=>{
            
             if(err) {
                 reject(err)
             };
          })
        
        conn.query(query,values, (err, results, fields)=>{
            conn.end();
            if(err){
                reject(err);
                
            }
            else{
                resolve(results);
            }
        })
        
    }) 
}

module.exports= sqlQuery;