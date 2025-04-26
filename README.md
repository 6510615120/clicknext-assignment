# Project Setup

This project uses Docker Compose to run the services.

## How to Run

1. Make sure you have **Docker** and **Docker Compose** installed.
2. In the project root, run:

```bash
docker-compose up -d
```

to stop

```bash
docker-compose down
```

once container running
use this http://localhost:5173

some feature is not securely for production
and I also so run it as development mode

all url path
- /boards
- /login
- /register

## Notices
once u login u got token for auth i didnt implement logout yet so if u want to logout u must delete token from browser manually
the api didnt check user that send so that now any user can still change any board if they backdoor
