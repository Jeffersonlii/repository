# repository

Video Showcase : https://youtu.be/2ZpIDB_Jfdg

### Description : 
Account based Image storage and sharing web app built using react and express, with NEDB database

### Features : 
- bulk add images
- delete images
- customizable image sharing 
  - users can choose to create a share link for their image
  - these links can have 'expire limits' that are date based or visits based

### implementation features
- security:
  - Session based authentification
  - Passwords are salted and hashed 
  - NoSQL injection sanitization
  - Image fetching is protected by authentification
- UI :
  - Intuitive UI
  - Helpful notifications
  - pagination

### Get Started
- clone the repo
- install dependencies 
  - `cd .\repository-backend\; npm i; cd .. `
  - `cd .\repository-frontend\; npm i; cd .. `
- run the app
  -  `cd .\repository-backend\; npm run start; cd .. `
  -  `cd .\repository-frontend\; npm run start; cd .. `
- view site
  - `http://localhost:3000/` 

### Testing
- Backend endpoints are tested by Jest
  - `cd repository-backend; npm run test`
### todo :
- [x] user login and registration
- [x] secure frontend routing
- [x] gallery view
- [x] share img functionality
- [x] backend sql injection and cookie security
- [x] frontend notifs (toast)
- [x] registration requirements
- [x] backend api testing (partly finished)
