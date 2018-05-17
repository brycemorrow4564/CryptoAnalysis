const setupConfigVars = (ee) => {

    let configPromise = new Promise((resolve, reject) => { 

        let configVarNames = [
            {
                'property': 'FROM_SCRATCH_MODE_ENABLED',   
                'local': true,
                'heroku': true
            },
            {
                'property': 'IS_LOCAL_RUN',                
                'local': true,
                'heroku': false
            },
            {
                'property': 'RUN_SCRAPER_ON_STARTUP',      
                'local': true,
                'heroku': true
            }, 
            {
                'property': 'PORT',                        
                'local': 8080,
                'heroku': 8080
            }
        ];

        let isLocal = process.env["DEPLOYED"] === undefined,
            deployType = isLocal ? "local" : "heroku";

        configVarNames.forEach((c) => { process.env[c.property] = c[deployType]; });

        resolve();
    }); 

    configPromise.catch(
        (err) => {
            ee.emit('error', {
                "contextMsg": "Error while setting up config variables for application", 
                "error": err
            }); 
        }
    );  

    return configPromise;
}; 

module.exports.setupConfigVars = setupConfigVars; 