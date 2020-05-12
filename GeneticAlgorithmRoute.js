const {workerData, parentPort}= require('worker_threads');
const fetch= require('node-fetch');

  


let population= [];
let fitness= [];
let bestOrder=[];
let lowestDistance=Infinity;
let populationSize=500;
let generations=500;
const placesToCalculate= workerData.places;
let numberofPlaces= placesToCalculate.length;
const myplace= workerData.myplace;
let optimalRoute;



coordinates= placesToCalculate.reduce((coordinates,place)=>{
    return coordinates + `${place.lon},${place.lat};`
},"");
coordinates= coordinates + `${myplace.lon},${myplace.lat};`;
coordinates= coordinates.slice(0,-1);


fetch(`http://localhost:5000/table/v1/foot/${coordinates}`)
    .then((response)=>{
        return response.json()
    })
    .then(distances=>{
        optimalRoute= getOptimalRoutes(placesToCalculate, distances.durations);
        parentPort.postMessage(optimalRoute);
        process.exit(0);
    })
    .catch((err)=>{
        console.log(err)
        process.exit(1);
    })
    






function getOptimalRoutes(places, duration=[]){
    let cities=[...places]; 
    lowestDistance=Infinity;
    let order=[]

    for(var i=0; i<numberofPlaces; i++){
        order[i]=i;
    }
    

    
    
    order= initialization(duration,order);
    for(let i=0;i<numberofPlaces;i++){
        places[i]= cities[order[i]];  
    }
    
    return places.slice();

}

function initialization(duration,order=[]){
    for(let i=0; i<populationSize; i++){
        
        population[i]=mutate(order, 1);
        
    }

    
  
   for(var i=0; i<generations; i++) {
        calcFitness(duration);
        normalizeFitness();
        nextGeneration();
    }

   return bestOrder.slice();
    
}

function mutate(orderarray=[], mutationRate){
    for(let i=0; i<orderarray.length; i++){
        first= Math.floor(Math.random()*orderarray.length);
        second= Math.floor(Math.random()*orderarray.length);
        var x= Math.random();
        if(x<mutationRate){
            temp= orderarray[first];
            orderarray[first]=orderarray[second];
            orderarray[second]=temp;
        }
        
    }
   return orderarray.slice();
}


function calcFitness(duration=[]){
    for(let i=0; i<populationSize; i++){
       let dist= getDistance(population[i],duration);
       if(dist<lowestDistance){
           lowestDistance= dist;
           bestOrder= population[i];
        }
        fitness[i]= 1/ (Math.pow(dist,8)+1);
    }
}

function normalizeFitness(){
    sum=0;
    for(let i=0; i<populationSize; i++){
        sum += fitness[i];
    }
    
    for(var i=0; i<populationSize; i++){
        fitness[i]= fitness[i]/sum;
    }
}

function pickOne(population,fitness){

    let index=0;
    let r= Math.random();

    while(r>0){
        r= r-fitness[index];
        index++;
    }
    index--;
    return population[index].slice();
}

function getDistance(order=[],duration=[]){
    let sum=0;
    for(let i=0; i<numberofPlaces-1;i++){
        indexA= order[i];
        indexB= order[(i+1)] ;
        dist= duration[indexA][indexB];
        sum += dist;
    }
    dist= duration[order[numberofPlaces-1]][numberofPlaces]
    sum += dist;
    return sum;
}

function nextGeneration(){
    let newPopulation= [];
    for(let i=0;i<populationSize;i++){
        let firstOrder= pickOne(population,fitness);
        let secondOrder= pickOne(population,fitness);
        let order= crossover(firstOrder,secondOrder);
        mutate(order, 0.01);
        newPopulation.push(order);
    }
    population= newPopulation;
}

function crossover(firstOrder, secondOrder){
    first= Math.floor(Math.random()*firstOrder.length);
    second= Math.floor(Math.random()*(firstOrder.length-first)+first);
    let newOrder= [];
    for(let i=first;i<second; i++){
        newOrder.push(firstOrder[i]);
    }
    for(let i=0; i<secondOrder.length;i++){
        if(!newOrder.includes(secondOrder[i])){
            newOrder.push(secondOrder[i]);
        }
    }
    return newOrder.slice();
}

