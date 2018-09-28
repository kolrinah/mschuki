# ms-invoice
Invoice microservice implemented in ExpressJS riding on top of NodeJS

Provides calls to manage details of an invoice - like the products included, billing, shipping information. 

# Layout

The project was created with [Express Generator](https://expressjs.com/en/starter/generator.html). It follows that general layout pattern with the addition of a modules directory. 

**Tree**

```
.
├── bin
│   └── www
├── modules
├── node_modules
├── public
├── routes
├── settings
├── test
│   ├── http
│   │   └── routes
│   └── unit
│   │   └── modules
└── views
```

# Local Building and Running

Once the repository is synced, the node modules need to be installed. Do this by running:

`npm install`

Once all the packages are installed, you can launch locally:

`npm run debug`

Once it is started the app will be running on http://localhost:3000/. 

# Making Changes

Edit the files that you want to change. You should see the service restarting due to changes. The exception are the pug template files. Changes made there will automatically displayed when you do a browser refresh. 

# Testing

Tests can be run by:

`npm test`

The tests will use a variance of four technologies:

1. [MochaJS](https://mochajs.org/) You can think of this as general framework for running the tests. It will find all test js files in the test folder and run them and display the results. Under the covers this what happens when you execute npm test. 

2. [Chai](http://chaijs.com/) This is a powerful expression tool that allows you compose your unit tests and evaluations in nice human readable syntax. It also has many useful plugins that be used to extend your tests without having to write everything from scratch. 

3. [Chai-http](http://chaijs.com/plugins/chai-http/) This is an HTTP wrapper plugin. It allows you to make real calls to your express app and get the responses back so you can check the validity  of the response. 

4. [sinon](http://legacy.sinonjs.org/) Sinon is a spy tool that allows you to create complicated mocks for your unit tests with ease. 

5. [rewire](https://github.com/jhnns/rewire) Rewire lets you mock variables inside a node module. Instead of requiring a module, you rewire it. Then you can set any variable to anything you want. See the documenation in the rewire repo for usage. Also look at the config.js module unit test for an example of it being used. 

# Debugging

Debugging is actually pretty easy in node. You can choose from any of these tools to get your debugger going. 

https://nodejs.org/en/docs/inspector/

## NPM

Once you have your 'Inspector' running, you can start the debugger in two modes:

1. Normal mode. `npm run debug` Use this mode for most tasks you are working on, like tests or routes. It needs the app to be able to start. 
2. Break mode. `npm run debug-brk` Thid mode will attach the debugger before the app starts. This is useful if you need to debug app startup crashes.

If you want to debug the unit tests you can also run `npm run debug-test` This will do the same as debug-brk, but as part of running the unit tests. 

## Visual Studio Code

Debugging is also enabled using Visual Studio Code. Refer to this how to get you started:

https://github.com/PeakActivity/omni/wiki/%5BHow-to%5D-Debug-node-projects-in-Visual-Studio-Code

# Linter

The service has been configured to use [ESlint](https://eslint.org/). We are using the [Peak Activity Config](https://github.com/standard/eslint-config-standard) with node enabled. You will see this with two .eslintrc.json files in the tree. The first enables node styling and the second file lives in the test folder enabling node and mocha. The test folder also turns off no-unused-expressions rule as chai totally breaks this rule. 

A `pretest` npm package script has been added to run the linter before each run of the unit tests. The `debug` and `debug-brk` package scripts have modified to run the pretest script each time nodemon restarts the service. So every time you modify the code in a development environment the linter will check your syntax to make sure you change is compliant. 

In additon, a new script called `dev` has been added. This runs nodemon and the pretest script just like the debug script, but without a debugger enabled. 

# Cloud Builds

Builds are done on a jenkins server running inside the Kubernetes cluster of the deployment. For the staging cluster rirst a docker image is built and then it rolled out, updating the existing deployment to use the new image with your new code changes. Preprod and production images are deployed on demand. 

## Build Job

The cloud build will run several steps:

1. Cloud Builder: ```npm install```
2. Cloud Builder: ```npm install mocha -g``` (Global mocha to run the tests)
3. Cloud Builder: ```npm test```
4. Cloud Builder: ```npm prune --production``` (reduce the installed node packages to just the production ones)
5. Docker container build - 

```
docker tag ${DOCKER_IMAGE_NAME} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${DOCKER_IMAGE_NAME}:latest$_BRANCH_NAME/${REPO_NAME}
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${DOCKER_IMAGE_NAME}:latest
```

All the npm node_modules should be built before the container and pruned of test code. (Like mocha, chai, etc.) This way the actual docker container build is as lean as possible. 

The docker image is pushed to AWS ECR. A repository for it should already have been created. 

## Deployment

The repo will build automatically via Jenkins when a change is pushed to the develop branch. You can check it out here:

http://jenkins.staging.kube.cityfurniture.com/server/

First an image will be created that contains your code changes. Then a rollout job will triggered to deploy the new image to the cluster. If everything works you will see the two pods for the deployment of your microservice be updated. If something is wrong with your deployment when you run `kubectl get pods` you will see an error on the status column. You will have to troubleshoot what is wrong and get the pod into a running state. 

# Configuration

All settings files are stored as JSON in the settings folder. The settings are then read by the config module. They are then available as objects off the config module. See app.js for an example of how this is loaded and then used to setup the swagger help. 

To add a new config file:

1. Create a new JSON file and place it in the settings folder. 
2. Edit the config.js to add a read settings method for your new settings file.
3. Add exports for you new settings file. (There are comments in config.js that show you where to do this.)
4. Create unit tests in the config.js module test file for you new settings file.

This is a bit of a cumbersome process at this point. We have stories ERP-250 and ERP-251 to make this easier. 
