# openui5.runtime.downloader
This bundle downloads the full blown officially released OpenUI5 runtime zip
using the packages own version from [Download UI5](http://openui5.org/download.html) and unpacks it locally
to the folder lib/<version>. It also deletes the debug javascript sources. With this it can be used
to statically and exposed by a webserver (i.e. node/express) and then be consumed by your UI5 app.

## Manual Steps for creating a new project

```
mkdir my.new.project
cd my.new.project
npm init
```

## Add dependencies

```
npm install --save express
npm install --save openui5.runtime.downloader
```

## Prepare NodeJS / Express

Assuming you have installed NodeJS already, you need to setup your
express app in the following way.

Create an app.js containing the static routes exposed like here:

app.js

```
.
app.use('/', express.static('static'));
app.use('/resources', express.static('node_modules/openui5.runtime.downloader/lib/<x.y.z>/resources'));
.
```

Don't forget to change <x.y.z> accordingly. 

## Create your OpenUI5 app

A good starting point to get an idea of how OpenUI5 works is here:
[OpenUI5.Org](http://openui5.org/getstarted.html)

Copy your example over to the static folder, adapt the ressources 
loading in the index.html:

```
<script id='sap-ui-bootstrap'
            src='../resources/sap-ui-core.js'
            data-sap-ui-theme='sap_belize'
            data-sap-ui-libs='sap.m'
            data-sap-ui-compatVersion='edge'
            data-sap-ui-preload='async'>
    </script>
```

## Start the server

```
node app.js
```

you then can access you app on [http://localhost:3000](http://localhost:3000)