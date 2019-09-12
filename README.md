# Teckedin

This is a content management platform that is a privacy driven technology marketplace. This repository hosts the front end for the app.

## Prerequisites

- Nodejs v8
- Npm v5

## Local deployment

1. Install the dependencies with the `npm install` command
2. Set the backend endpoint url in `app/js/api.js` file. Refer to the `BACKEND_HOST` variable.
3. Launch the app with `npm start` command. You can access the app at `http://localhost:3001` by default

## AWS EC2 deployment

- connect to ec2 instance , and make sure you installed node
- install pm2 `npm install pm2 -g`
- `git clone <teched-in app git repo url>` clone the master branch frontend code , and goto the teckin-frontend folder
- update BACKEND_HOST in *app/js/api.js* ,
- `npm i` install node dependencies
- `npm run pm2` use pm2 startup and manager the node frontend program

## Heroku deployment

modify the backend api url *app/js/api.js*

```shell
npm run prestart
git init

git add .

git commit -m "init"

heroku create

git push heroku master
```

## Config

you can modify config values in *app/js/api.js* , include backend host, paging ,etc..

## Default Account Details

1. tech user : email `user0@email.com`, password `123456`
2. tech provider : email `provider0@email.com`, password `123456`

## Stylesheets

When any changes are made to the styles in the sass files, you need to generate the CSS file by invoking the command:

```bash
./node_modules/.bin/sass app/scss/styles.scss app/css/styles.css
```
