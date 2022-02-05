#!/bin/bash

db="mariadb"
if ! command -v mariadb &> /dev/null; then
  db="mysql"
fi

if [[ ! -n "$1" ]]; then
  echo "Usage: ./database.sh {username} {password} [create_user](to create the specified user, needs root access)"
  exit
fi

db_name="echouage"
username=$1
password=$2

if [ $3 = "create_user" ]; then
  sudo $db --user="root" --execute="\
    CREATE DATABASE $db_name; \
    CREATE USER '$username'@'localhost' IDENTIFIED BY '$password'; \
    GRANT ALL PRIVILEGES ON '$db_name'.* TO $username@'localhost'" \
    -p $MARIADB_ROOT_PASSWORD
fi

sudo $db --user=$username --password=$password --database=$db_name --execute="\
  source echouage-structure.sql; \
  source echouage-data.sql; \
  source echouage-data.sql;"

if [[ ! -f  "../back-office/.env.local" ]]; then
  cp ../back-office/.env ../back-office/.env.local
fi

sed -i "s/db_name/$db_name/" ../back-office/.env.local
sed -i "s/db_user/$username/" ../back-office/.env.local
sed -i "s/db_password/$password/" ../back-office/.env.local
