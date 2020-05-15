# Real-Time Augmented Reality for Virtual Try-on

##### SJSU CMPE Master Project
##### Pragya Gautam, Mojdeh Keykhanzadeh, Sithara Krishna Murthy, and Vidhi Shah

### Introduction
Virtual try-on is becoming a way to make online shopping more appealing as it enhances
interaction between customers and E-commerce sites. Virtual try-on is enhancing customers' experience by allowing them to try-on products even while browsing products online, which traditionally could not do so. The goal of the Real Time Augmented Reality for Virtual TryOn project is to provide E-commerce customers with a system that allows them to virtually try on a variety of products in real time while preserving their privacy. By simply accessing the site, customers can experience try-on features with their webcam live video and image. It can run on any platform by having a capability of cross-platform support.

### Installation

### Pre-Requisites

It is assumed that below libraries are already available and ready-to-use before starting with the installation:
Npm
Node.js
python

- Clone this repo to your local machine using 
`git clone https://github.com/vidhishah22/Master-Project-295A-B.git`

### Front-End Setup

After cloning the application, navigate to the front-end folder and run the below command to install all the dependencies for the node.js project. 
```shell
$ npm i
```
Generate the privatekey.pem and certificate.pem files using the following commands:
```shell
$ openssl genrsa -out privatekey.pem 1024
$ openssl req -new -key privatekey.pem -out certrequest.csr
$openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

Create the following folders with specified names  - 
```shell
./front-end/input
./front-end/noalpha
./front-end/public/output
```

RabbitMQ SetUp
Install RabbitMQ - `sudo apt-get install rabbitmq-server`
Create a user with password - `sudo rabbitmqctl add_user admin password` 
Add user as admin - `sudo rabbitmqctl set_user_tags admin administrator`
install amqp.node using npm -  `npm install amqplib`
Open the RabbitMQ portal on browser: http://localhost:15672/ 
In Admin tab - Add VTO as host for Admin

### Back-End Setup

To set up the back-end, navigate to the back-end folder and start by creating a virtual environment. Follow below commands to do so:
```shell
$ apt-get update -y
$ apt-get install -y python3-venv
$ python3 -m venv venv
$source venv/bin/activate
```
Once venv is activated, run below command to install all the back-end dependencies within python project for clothes try-on module
```shell
$ pip install -r requirements.txt
```
Install octave library:
```shell
$ sudo apt-get install octave
```
Once installed, invoke octave by typing: `octave`
Within the octave shell, install the image package:
```shell
$ pkg install -forge image
$ pkg load image
```

Come out of octave shell, and run below command to install necessary files/folders along with pre-trained models, required for the clothes try-on: `./setup.sh` 

### Run the Web-Application
To start running the application, go to the front-end folder, and start the consumer process:
`node consumer.js`
Then start the node.js server with:
`npm start`
This will deploy the web application over 7000 port. The website can be opened at: https://localhost:7000/
