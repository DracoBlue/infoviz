#!/usr/bin/ruby
#
# Example usecase:
#     ruby tbm.rb import ../data/20070618Data_c.txt http://localhost:5984/test
#
# importiert die Datei ../data/20070618Data_c.txt in die CouchDB unter der URL
#

require 'rubygems'
require 'json'
require 'thor'
require 'thor/actions'
require 'typhoeus'
require 'fastercsv'
#require 'csv'

def post!(url, body = '')
  response = Typhoeus::Request.post(url, :body => body, :headers => {'Content-type' => 'application/json'})
  response
end

def put!(url, body = '')
  response = Typhoeus::Request.put(url, :body => body, :headers => {'Content-type' => 'application/json'})
  response
end

class TBM < Thor

  include Thor::Actions

  desc 'import FILE DB_URL', 'imports a csv file into a couchdb'
  def import(file, couch)

    filename = File.basename(file)
    basename = filename.sub(/Data_c\.txt$/,'')

    zuordnung = []
    FasterCSV.foreach('../data/Zuordnungstabelle.txt', :col_sep => "\t", :headers => true) do |row|
      zuordnung.push(row[1]) # nr => benennung
    end
    
    FasterCSV.foreach(file) do |row|
      data = {}
      zuordnung.zip(row) { |col, val| data.store(col, val) }
      counter = data['New_Counter'].sub!(/\.00$/,'')
      id = "#{basename}-#{counter}"
      data.store('_id', id)
      data.store('filename', filename)
      json = JSON.pretty_generate(data)
      post!(couch, json)
    end        
    
  end

  desc 'target DB_URL', 'imports Zielvektoren_mitGeo.txt into couchdb'
  def target(couch)
    data = {'_id' => 'zielvektoren'}
    spalten = %w"Kartierung_Schicht VK Vortriebsmodus Tunnelmeter Ring Datum"
    
    FasterCSV.foreach('../data/Zielvektoren_mitGeo.txt', :col_sep => "\t", :headers => true) do |row|
      data.store(row['Ring'], row.to_hash)
    end
    
    begin 
      json = 'noch kein json'
      json = JSON.pretty_generate(data)
      put!("#{couch}/#{data['_id']}", json)
    end
  end

end

TBM.start


