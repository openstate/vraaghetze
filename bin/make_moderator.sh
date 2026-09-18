#!/bin/bash
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
source "$ROOT_DIR/.env"

EMAIL=$1
if [ -z "$EMAIL" ]; then
  echo "Usage: make_moderator email_address"
  echo "This will add role=moderator to the user with that email address"
  exit
fi

OLD_ROLE=`sudo docker exec vraaghetze-db-1 psql -t -U $POSTGRES_USER -d $POSTGRES_DB -c "select role from public.user where email='$EMAIL';"`
OLD_ROLE=`echo $OLD_ROLE | xargs` # Trim spaces begin/end
echo "Old role: $OLD_ROLE"

echo "Now trying to set role to moderator"
RESULT=`sudo docker exec vraaghetze-db-1 psql -U $POSTGRES_USER -d $POSTGRES_DB -c "update public.user set role='moderator' where email='$EMAIL';"`
echo $RESULT
