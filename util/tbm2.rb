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
    
    schichten = get_schichten(file)

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
    
    layers = {}
    conf['layers'].each {|l| layers[l['name']] = {'id' => l['id'], 'color' => l['color']}}
    
    
    s = schichten(file)
    stretch = conf['width'] / s['width']
    
    program = "coffee schichten.coffee"
    args = "#{conf['filename']} #{conf['width']} #{conf['height']} "
    
    s['layers'].each do |l|
      
      layer = layers[l['name']]
      
      if l != s['layers'].last
        args += "#{layer['color']} #{l['end']*stretch} "
      else
        args += "#{layer['color']}"
      end
    end
    
    puts "#{program} #{args}"
  end

  desc "attr FILE, IN_DIR OUT_DIR", "generate all attributes"
  def attr(file, in_dir, out_dir = "./out/")
    
    sensors = (3..45) # eigentlich 6..46
    out_files = {}
    sensors.each do |s|
      out_files[s] = File.open("#{out_dir}/#{s+1}.json", 'w')
    end
    
    schichten = get_schichten_data(file)
    #puts schichten
    
    pattern = /\d*Data_c.txt/
    files = Dir.new(in_dir).entries.select {|f| f[pattern]}  

    files.each do |file|
      current = {}
      FasterCSV.foreach("#{in_dir}/#{file}") do |row|
        ring = row[2].to_i
        if (current[:c] != ring)
          current[:c] = ring
          current[:g] = schichten[ring]
        end
        
        sensors.each do |i|  
          current[:v] = row[i].to_f
          json = current.to_json
          out_files[i].write("#{json},")
        end
      end 
    end
  end


  private
  def get_schichten_data(file)
    data = {}
    
    FasterCSV.foreach(file, :col_sep => "\t", :headers => true) do |row|
      if (row['Ring'] && row['Kartierung_Schicht'])
        data[row['Ring'].to_i] = row['Kartierung_Schicht']
      end
    end
    
    return data
  end
  
  def get_schichten(file)
    
    data = get_schichten_data(file)
    
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
    
    return schichten
  end
  

end

TBM.start

