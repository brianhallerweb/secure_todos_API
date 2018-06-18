// process.env.NODE_ENV is "production" on heroku
// if you had tests, process.env.NODE_ENV could be set
// to "test" through an npm script. That would allow for
// a separate test database.
const env = process.env.NODE_ENV || "development";

if (env === "development") {
  const config = require("./config.json");
  Object.keys(config[env]).forEach(
    key => (process.env[key] = config[env][key])
  );
}
