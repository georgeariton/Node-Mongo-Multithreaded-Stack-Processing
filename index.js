const App = require(__dirname + "/src/App.js");
const childScript = require.resolve(__dirname + "/processors/Child.js");

new App(childScript, (data) => {

});




