# 42-Hypertube

The hypertube 42 project, end of the web branch. Hypertube is a streaming platform using peer to peer APIs to host and share videos. 

Sign in page : 

Home page : 

Profile page :

Movie Page : 

## Getting started
### Disclaimer
**This project was made for _learning_ only, and will never be hosted live. Use at your own risk**
### Prerequisites
This project only runs on **Linux/MacOs systems**, there is issues with path naming with windows systems. 

**You need access to our database, and the .env file containing API keys.**

You also need [nodejs](https://nodejs.org/en/download/). 

### Installing
Install all npm packages at the root directory
```
npm install
```

The project is running on 1 server for both frontend and backend. 
```
npm start
```

## Workflow
We worked with different branches for each feature. When one feature is finished, the code is ran through some [unit test](https://jestjs.io/), it must also respect our [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) formatting to be commited. 

Once the branch is considered done, a pull request is sent, and must be approved to be merged to the main branch.

### Testing
The feature must clear all tests. 
```
npm run test
```

The output must also match the existing snapshot. If the output was changed on purpose, the snapshot must be updated.
```
npm run test:jest -- -u
```

## Built With
* Node.js
* React - With TypeScript
* MongoDB

## Contributors

* [jcharloi](https://github.com/Jcharloi)
* [jde-maga](https://github.com/jde-maga)
* [psim](https://github.com/psim42)
* [fmuller](https://github.com/FlorianMuller)
* [hcasanov](https://github.com/hcasanov)
