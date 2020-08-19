const workerFarm = require('worker-farm');

class StackHandler
{
    constructor(config = {}, childScript)
    {
        const defaults = {
            "workerOptions": {},
            "maxCallsPerWorker": Infinity,
            "maxConcurrentWorkers": 2,
            "maxConcurrentCallsPerWorker": 10,
            "maxConcurrentCalls": Infinity,
            "maxCallTime": Infinity,
            "maxRetries": Infinity,
            "autoStart": false,
            "onChild": function() {

            }
        };

        let options = {...defaults, ...config};

        for (let option in options) {
            if (options[option] === -1) {
                options[option] = Infinity;
            }
        }

        this.workerFarm = workerFarm(options, childScript);
    }

    enqueueProcesses(doc, callback)
    {
        //@TODO: use promises
        this.workerFarm(doc, callback);
    }
}

module.exports = StackHandler;