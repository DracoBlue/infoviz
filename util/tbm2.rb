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

    layers = []
    for_image = {
      'width' => width,
      'layers' => layers
    }

    puts "offset = #{offset}"
    puts "width (w/o offset) = #{width}"
    puts "----------------"
    puts "breiten: "
    schichten.each do |s|
      puts "  '#{s[:name]}' endet bei #{s[:end] - offset}"
      layers.push({'name'=>s[:name], 'end' => s[:end] - offset})
    end
    
    return for_image
  end


  desc "image DATA_FILE [CONFIG_FILE]", "erzeugt ein Bild der Schichten"
  def image (file, config_file="config.json")
    conf = JSON.parse(File.read(config_file))['schichten']
    
    s = schichten(file)
    stretch = conf['width'] / s['width']
    
    program = "coffee schichten.coffee"
    args = "#{conf['filename']} #{conf['width']} #{conf['height']} "
    
    s['layers'].each do |layer|
      if layer != s['layers'].last
        args += "#{conf['colors'][layer['name']]} #{layer['end']*stretch} "
      else
        args += "#{conf['colors'][layer['name']]}"
      end
    end
    
    puts "#{program} #{args}"
  end

end

TBM.start

