const dbInit = require('./src/config/dbInit');
dbInit.initialize().then(() => {
   console.log("Done");
   process.exit(0);
});
