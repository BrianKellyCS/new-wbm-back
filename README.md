**Documentation for the database and server**

Tech Stack:

```
Database -> postgreSQL
Web Server -> Node.js with Express library
```

# Database

1. Create and name a postgreSQL database using pgAdmin
2. Note followings since they will be needed for later:
   - host or endpoint
   - port
   - user
   - password
   - database name
3. Run a query to create necessary tables:
<pre>

```sql
CREATE TABLE devices (
  id SERIAL NOT NULL,
  unique_id INTEGER NOT NULL PRIMARY KEY,
  is_registered BOOLEAN NOT NULL,
  lat VARCHAR(100) NULL,
  lng VARCHAR(100) NULL,
  battery SMALLINT NULL,
  level SMALLINT NULL,
  reception SMALLINT NULL,
  bin_height SMALLINT NULL,
  timestamp TIMESTAMPTZ NULL DEFAULT current_timestamp,
  temp DOUBLE PRECISION NULL,
  humidity DOUBLE PRECISION NULL
);

CREATE TABLE feedbacks (
  id SERIAL NOT NULL PRIMARY KEY,
  device_id VARCHAR(100) NULL,
  reported_by_id SMALLINT NULL,
  reported_by_name VARCHAR(100) NULL,
  title TEXT NULL,
  description TEXT NULL,
  assigned_to SMALLINT NULL,
  addressed BOOLEAN NOT NULL DEFAULT false,
  addressed_date TIMESTAMPTZ NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  devicetype VARCHAR NULL
);

CREATE TABLE historical (
  id SERIAL NOT NULL PRIMARY KEY,
  unique_id INTEGER NOT NULL,
  level_in_percents SMALLINT NULL,
  saved_time TIMESTAMPTZ NULL DEFAULT current_timestamp
);

CREATE TABLE users (
  id SERIAL NOT NULL UNIQUE,
  fname VARCHAR(100) NULL,
  lname VARCHAR(100) NULL,
  email VARCHAR(100) NOT NULL PRIMARY KEY,
  password VARCHAR(500) NULL,
  role VARCHAR(9) NULL,
  start_date DATE NULL
);

CREATE TABLE routes (
  id SERIAL NOT NULL PRIMARY KEY,
  employeeid INTEGER NULL,
  deviceids INTEGER[] NOT NULL,
  emptybin BOOLEAN NOT NULL,
  changebattery BOOLEAN NOT NULL,
  status VARCHAR(30) NOT NULL,
  started TIMESTAMP NULL,
  finished TIMESTAMP NULL,
  timestamp TIMESTAMP NULL DEFAULT current_timestamp,
  CONSTRAINT routes_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES users (id)
);

CREATE TABLE weather_sensors (
  id SERIAL NOT NULL,
  unique_id INTEGER NOT NULL PRIMARY KEY,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  lat VARCHAR NULL,
  lng VARCHAR NULL,
  battery SMALLINT NULL,
  reception SMALLINT NULL,
  temp SMALLINT NULL,
  humidity SMALLINT NULL,
  timestamp TIMESTAMPTZ NULL DEFAULT current_timestamp
);

```

</pre>

4. Verify no errors occured during the query execution

# Node.js + Express.js Server Setup

_[Node](https://nodejs.org/en/download) has to be installed on the machine!!!_
To make sure it is installed, run both commands one after another:

```
node -v
npm -v
```

Both need to show their installed versions to make sure they are working properly

1. Clone GitHub [repo](https://github.com/BrianKellyCS/new-wbm-back.git)
2. Open terminal (or GitBash) in the folder directory
3. Run command:

```
npm i
```

4. Create a file called _.env_ in root directory of the folder
5. Add following environmental variables to that file:

```
DATABASE_URL=postgresql://{username}:{password}@{hostname}:{port}/{database_name}

JWT_SECRET_KEY={json web token secret key (may be a random string)}

```

6. Verify the server starts as necessary by running the following command:

```
npm start
```

Which should print _Listening to port 3000_

_If reached here, the setup for both database and server is done_
