//Todo 1. Add error responses to JSON API
//Todo 2. Precompute JSON responses
//Todo 3. Add check so that two jobs are not ever in process at the same time
//Todo 4. Add logified data field to JSON API queries. See if this can be handled via some Highstock chart option
//Todo 5. Add rate limiting to the API. Do this via a user registration system to grant access. Find some npm plugin

module.paths.push('/usr/local/lib/node_modules'); //COMMENT OUT FOR DEPLOYMENT

const thread = require('./NodeApp/MainThread');
thread.run();
