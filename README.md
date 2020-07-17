# Cassandra REST API

## Overview
This repository hold codebase for the REST API developed for Cassandra using Loopback.

## Details

Follow the guidelines given below to use the API.

1. Install Java.

2. Install nodejs and npm.

3. Install docker daemon.

4. Install cassandra on your system as a service or as a docker container. I will use it as a docker container:

```bash
sudo docker run --net host cassandra:3.11.6
```

5. Install mysql on your system as a service or as a docker container. I will use it as a docker container:

```bash
sudo docker run --net host -e MYSQL_ROOT_PASSWORD=an10 mysql:5.7
```

6. 