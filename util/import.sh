#!/bin/bash
if [ -d ../data ]; then

  if [ "$1" != "" ]; then
    for f in ../data/*Data*
    do
      echo "Importing $f ..."
      ./tbm.rb import $f $1
    done
  else
    echo "Usage: $0 URL"
  fi
  
else
  echo There is no ../data folder. Add data and rerun $0.
fi
