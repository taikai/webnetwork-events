# webnetwork-events
microservice that reacts to webnetwork events

## Developing
Install dependencies and pull the postgres models from the database 
- don't forget to create a .env file following [.env.example](./.env.example))
- don't forget to pull new modules if you change branch locally


```shell
$ npm install
$ npm run update-models
```

| folder  | description                                |
|---------|--------------------------------------------|
| db      | models and configuration                   |
| tools   | scripting tools                            |
| actions | event-reader actions to be consumed by cma |
| utils   | helpers for developers                     |

## Starting the event reader
```shell
$ npm start
```