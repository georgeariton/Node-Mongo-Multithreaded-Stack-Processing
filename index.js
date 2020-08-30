// Config part
const {connection: mongoConnection, options: mongoOptions} = require("./src/config/mongo.json");
const {farm: farmOptions} = require("./src/config/worker-farm.json");

// Logic part
const App = require("./src/App.js");
// The script that will eventually execute for each input
const childScript = require.resolve("./processors/Child.js");

// Demo handling of the script
new App(childScript, {
    mongoConnection: mongoConnection,
    mongoOptions: mongoOptions,
    farmOptions: farmOptions
}, (data) => {
    console.log(data);
});





