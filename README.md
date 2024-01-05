# RolePlay Money manager

## Description
TODO

## Build
1. Edit the machine `/etc/hosts` file to add docker containers hosts
```bash
sudo nano /etc/hosts
# Add those lines
> 127.0.0.1 mongo1
> 127.0.0.1 mongo2
> 127.0.0.1 mongo3
```

## Run in development mode
1. Run the docker-compose file
```bash
docker-compose up
```

2. Run the application
```bash
npm start
```