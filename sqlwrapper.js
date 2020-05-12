const mysql= require('mysql');

function sqlQuery(query, values){
    return new Promise((resolve,reject)=>{
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
                 reject(err)
             };
          })
        
        conn.query(query,values, (err, results, fields)=>{
            conn.end();
            if(err){
                console.log(err)
                reject(err);
                
            }
            else{
                resolve(results);
            }
        })
        
    }) 
}

module.exports= sqlQuery;