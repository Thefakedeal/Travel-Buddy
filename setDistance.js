const { Worker } = require('worker_threads');
// Wrapping Worker Thread into a Promise Function
function setDistance(places, lat, lon) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./getDistance.js', { workerData: { places, lat, lon } });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped on code ${code}`));
        });
    });
}
exports.setDistance = setDistance;
