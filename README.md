# App-AutoScaler-UI

The UI project for [App-AutoScaler](https://github.com/cloudfoundry-incubator/app-autoscaler). Written with Golang/ReactJS/Redux/ES6/Webpack stack, tested by ginkgo/jest/enzyme.

The App-AutoScaler-UI provides user interface to manage the app-autoscaler service and app:
* **ServiceView page**: bound apps of the service instance
* **AppView Page**:
  * **Policy Page**: view/edit application policy
  * **Metrics Page**: metrics dashboard
  * **History Page**: scaling history

## Development

### System requirements

* [Node 10.8.0 or above](https://nodejs.org)
* [NPM 6.4.1 or above](https://www.npmjs.com)
* [Go 1.7](https://golang.org/dl/)
* [Cloud Foundry cf command line](https://github.com/cloudfoundry/cli/releases)

### Setup

1. Clone the project

```shell
$ git clone https://github.com/cloudfoundry-incubator/app-autoscaler-ui.git
```

2. Build front-end resources, the target resources will be saved in the folder `app-autoscaler-ui/view/dev/`
```shell
$ cd app-autoscaler-ui/view
$ npm install
$ npm run build
```

3. Build back-end resources, the target executable file will be saved in the file `app-autoscaler-ui/scalerui`
```shell
$ cd app-autoscaler-ui
$ git pull && git submodule foreach --recursive git submodule sync && git submodule update --init --recursive
$ source .envrc
$ go build -o scalerui src/scalerui/cmd/ui/ui.go
$ chmod +x scalerui
```

### Tests
```shell
$ cd app-autoscaler-ui
$ go get github.com/onsi/ginkgo/ginkgo
$ ginkgo -r -race -randomizeAllSpecs
$ cd view
$ npm run test:coverage
```

### Run Locally

1. Update front-end resources path to yours in `app-autoscaler-ui/src/scalerui/exampleconfig/exampleconfig.yml`
```yaml
  ...
  view_path: "/Users/abc/app-autoscaler-ui/view/dev"
  ...
```

2. Start
```shell
$ cd app-autoscaler-ui
$ ./scalerui -c ./src/scalerui/exampleconfig/exampleconfig.yml
```

3. Access
* ServiceView page: https://localhost:8080/manage/{SERVICE_INSTANCE_ID}
* AppView Page: https://localhost:8080/apps/{APPLICATION_ID}

## Deploy App-AutoScaler-UI as a CF applictaion

1. **Make sure App-AutoScaler is available in your CF environment**

2. Build and push App-AutoScaler-UI as a CF applictaion
```shell
$ cd app-autoscaler-ui/scripts
$ ./build.sh -cd <CF_DOMAIN> -cu <CF_USER> -cp <CF_PASSWORD> -co <CF_ORG> -cs <CF_SPACE> -ac <CLIENT_ID> -as <CLIENT_SECRET> -aso <CLIENT_SCOPE> -host <UI_APP_NAME> -curls <CONSOLE_URLS>
```
Options for `build.sh`:
```
-cd                - cf domain
-cu                - cf user
-cp                - cf password
-co                - cf org
-cs                - cf space
-ac                - autoscaler_client_id (find in the deployment of app-autoscaler)
-as                - autoscaler_client_secret (find in the deployment of app-autoscaler)
-aso               - autoscaler_client_scope
-host              - scalerui host name
-curls             - console urls (support multiple urls, separated by commas)
```

3. Access
* ServiceView page: https://<UI_APP_NAME>.<CF_DOMAIN>/manage/{SERVICE_INSTANCE_ID}
* AppView Page: https://<UI_APP_NAME>.<CF_DOMAIN>/apps/{APPLICATION_ID}

## Project Structures

### `scripts/` -- build scripts and templates

| Folder/File                | Description                                          |
|:---------------------------|:-----------------------------------------------------|
| build.sh                   | build and push App-AutoScaler-UI as a CF applictaion |
| cf_app_config_template.yml | back-end config template used in build.sh            |
| config.js.erb              | front-end config template used in build.sh           |
| manifest_template.yml      | manifest template used in build.sh                   |
| yml2js.rb                  | produce target config file                           |

### `src/scalerui` -- back-end code

| Folder/File                | Description                                          |
|:---------------------------|:-----------------------------------------------------|
| auth/                      | authorization middleware: sso and uaa                |
| clickjacking/              | clickjacking middleware                              |
| cmd/                       | entrance of the project                              |
| config/                    | config produce and validation                        |
| endpoints/                 | cc endpoints                                         |
| exampleconfig/             | default config yaml                                  |
| helpers/                   | useful helpers and tools                             |
| https/                     | https redirection middleware                         |
| middleware/                | gzip header middleware                               |
| models/                    | object and data structure                            |
| routes/                    | api routes defination                                |
| server/                    | api request handlers                                 |
| session/                   | session management                                   |

### Front-end code -- `view/`

Typical react/webpack coding styles. Here is instructions for important folders and files

| Folder/File                | Description                                          |
|:---------------------------|:-----------------------------------------------------|
| __mocks__/                 | mocked componets for jest                            |
| __tests__/                 | jest testing codes, corresponds to src folder        |
| coverage/                  | testing report, generated by `npm run test:coverage` |
| dev/                       | build files, generated by `npm run build`            |
| lib/                       | imported custom libraries                            |
| node_modules/              | dependencies, generated by `npm install`             |
| src/                       | react source codes                                   |
| src/actions/               | flux actions                                         |
| src/common/                | common tools and functions                           |
| src/components/            | react views                                          |
| src/constants/             | constants and PII files                              |
| src/images/                | image resources                                      |
| src/reducers/              | redux reducers for actions                           |
| src/sources/               | api calls to backend                                 |
| src/store/                 | flux data stores                                     |
| src/styles/                | sass/css style sheets                                |
| src/app.js                 | entrance for project source                          |
| src/config.default.js      | config file for view standalone debug                |
| src/config.js              | config file for debug                                |
| src/config.test.js         | config file for jest                                 |
| src/index.html             | entrance html for view standalone debug              |
| src/index.test.html        | entrance html                                        |
| src/router.js              | route configuration                                  |
| package.json               | main config for project                              |
| init.js                    | initial actions before build                         |
| init.test.js               | initial actions before local debug                   |
| webpack.config.js          | webpack lifecycle config for dev                     |
| webpack.pro.config.js      | webpack lifecycle config for build                   |
