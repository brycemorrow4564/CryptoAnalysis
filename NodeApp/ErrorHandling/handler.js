const setupEventDrivenErrorHandling = () => {
    
    let errorHandlingPromise = new Promise((resolve, reject) => {
        //Define general error handling behavior. Have errors propagate up from a specific context 
        //via the emission of an error event. Errors will include context specific information based
        //on the location where it was thrown as well as the error that was initially thrown. 
        ee.on('error', (errObj) => { 
            console.log(`CONTEXT SPECIFIC ERROR MSG:${"\n"}${errObj.contextMsg}${"\n"}THROWN ERROR MSG: ${errObj.error.message}${"\n"}`); 
            //throw error; 
        }); 
        resolve(); 
    }); 

    errorHandlingPromise.catch((err) => { throw err; }); //THIS SHOULD NEVER HAPPEN  
    return errorHandlingPromise; 
}; 

module.exports.setupEventDrivenErrorHandling = setupEventDrivenErrorHandling; 