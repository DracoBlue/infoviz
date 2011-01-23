#!/usr/bin/ruby
#
# Beispiel Aufruf:
#
#   ruby tbm2.rb schichten ../data/Einsatz1/Einsatz1_Geologie.txt
#
#
#

require 'rubygems'
require 'json'
require 'thor'
require 'thor/actions'
require 'fastercsv'


class TBM < Thor

  include Thor::Actions

  desc 'schichten FILE', 'readsimports a csv file into a couchdb'
  def schichten(file)
    
    data = {}
    
    FasterCSV.foreach(file, :col_sep => "\t", :headers => true) do |row|
      if (row['Ring'] && row['Kartierung_Schicht'])
        data[row['Ring']] = row['Kartierung_Schicht']
      end
    end
    
    schichten = []
    current = {}
    
    data.keys.sort.each do |key|
      if (data[key] != current[:name])
        current = {
          :name => data[key],
          :start => key.to_i,
          :end => key.to_i
        }
        schichten.push(current)
      else
        current[:end] = key.to_i
      end
    end

    offset = schichten.first[:start]
    width = schichten.last[:end]-offset
    puts "offset = #{offset}"
    puts "width (w/o offset) = #{width}"
    puts "----------------"
    puts "breiten: "
    schichten.each do |s|
      puts "  '#{s[:name]}' endet bei #{s[:end] - offset}"
    end
    
  end

end

TBM.start

