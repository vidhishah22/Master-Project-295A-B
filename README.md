# Real-Time Augmented Reality for Virtual Try-on
##### SJSU CMPE Master Project
##### Pragya Gautam, Mojdeh Keykhanzadeh, Sithara Krishna Murthy, and Vidhi Shah

## Installation
- All the `code` required to get started
- Images of what it should look like

### Clone
- Clone this repo to your local machine using `https://github.com/vidhishah22/Master-Project-295A-B.git`

### Front-End Setup
After cloning the application, go inside the front-end folder and run below command to install all the dependencies for the node.js project. 
```shell
$ npm i
```
Generate the privatekey.pem and certificate.pem files using the following commands:
```shell
$ openssl genrsa -out privatekey.pem 1024
$ openssl req -new -key privatekey.pem -out certrequest.csr
$ openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```


