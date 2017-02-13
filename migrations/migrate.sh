#!/bin/bash

PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )

if [[ $1 == '' ]];
then
  for file in $PARENT_PATH/*.sql; do
    cat $file | sqlite3 $PARENT_PATH/../database.db
  done
else
  cat $1 | sqlite3 $PARENT_PATH/../database.db
fi
