const { Worker } = require('worker_threads');
// Wrapping Worker Thread into a Promise Function
function optimalRoute(places, myplace={}) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./GeneticAlgorithmRoute.js', { workerData: { places, myplace } });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped on code ${code}`));
        });
    });
}
module.exports = optimalRoute;
 