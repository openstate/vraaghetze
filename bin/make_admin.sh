#!/bin/bash
EMAIL=$1
if [ -z "$EMAIL" ]; then
  echo "Usage: make_admin email_address"
  echo "This will add role=admin to the user with that email address"
  exit
fi

OLD_ROLE=`sudo docker exec vraaghetze-db-1 psql -t -U postgres -d vraaghetze -c "select role from public.user where email='$EMAIL';"`
OLD_ROLE=`echo $OLD_ROLE | xargs` # Trim spaces begin/end
echo "Old role: $OLD_ROLE"

echo "Now trying to set role to admin"
RESULT=`sudo docker exec vraaghetze-db-1 psql -U postgres -d vraaghetze -c "update public.user set role='admin' where email='$EMAIL';"`
echo $RESULT
