Initial Version


This project is a couchapp for exploring data. We don't have any rights on the data used, that's why it isn't included in this repository.

The project consists of an command line import tool written in Ruby and a CouchApp that uses [Soca](https://github.com/quirkey/soca). You need to install Soca by running
    gem install soca

This should install all dependencies you need for the command line tool.


To import the data into your couchapp run
    thor tbm:install <file> <couchdb>
    thor tbm:target <couchdb>


