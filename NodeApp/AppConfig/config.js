const setupConfigVars = (ee) => {

    let configPromise = new Promise((resolve, reject) => { 

        const configParse = (value, parseType) => {
            let parseFailed = false, 
                thrownErr, 
                retVal; 
            if (parseType === 'boolean') {
                if (value === 'true')  { retVal = true; }
                else if (value === 'false') { retVal = false; }
                else { parseFailed = true; }
            } 
            else if (parseType === 'integer') {
                try { retVal = parseInt(process.env[c.property]); } 
                catch (err) { thrownErr = err; parseFaild = true; }
            } 
            else { 
                parseFailed = true; 
            }
            if (parseFailed) {
                ee.emit('error', {
                    "contextMsg": "Error occurred while parsing types of config variables", 
                    "error": thrownErr ? thrownErr: new Error("") 
                }); 
            }
            return retVal; 
        }; 
        
        let configVarNames = [
            {
                'property': 'FROM_SCRATCH_MODE_ENABLED',   
                'valueIfNotDefined': false,
                'parseTypeIfDefined': 'boolean'
            },
            {
                'property': 'IS_LOCAL_RUN',                
                'valueIfNotDefined': false,
                'parseTypeIfDefined': 'boolean'
            },
            {
                'property': 'RUN_SCRAPER_ON_STARTUP',      
                'valueIfNotDefined': false,
                'parseTypeIfDefined': 'boolean'
            }, 
            {
                'property': 'PORT',                        
                'valueIfNotDefinied': 8080, 
                'parseTypeIfDefined': "integer" 
            }
        ]; 

        configVarNames.forEach((c) => {
            if (process.env[c.property] === undefined) {
                //Property is not defined as a heroku configuration variable. Fallback to local value
                process.env[c.property] = c.valueIfNotDefined; 
            } else {
                //Property is defined by heroku. Check to see if we need to parse type and do so if necessary 
                if (typeof c.parseTypeIfDefined === 'string') {
                    //if this is true we defined a type to parse for 
                    process.env[c.property] = configParse(process.env[c.property], c.parseTypeIfDefined); 
                }
            }
        });
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