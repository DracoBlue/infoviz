puts = require('sys').puts
Canvas = require 'Canvas'
fs = require 'fs'
_ = (require 'underscore')._ # this problem is fixed in underscore.js 1.1.3
graph= require('./graph')

#puts process.argv

i = 2
file_a  = process.argv[i++]
file_b  = process.argv[i++]
out_file= process.argv[i++]


{values: a} = JSON.parse(fs.readFileSync(file_a, 'utf8'))
{values: b} = JSON.parse(fs.readFileSync(file_b, 'utf8'))



merge = (a,b) ->
  _.map(_.zip(a,b), (x) ->
    [a, b] = x
    obj = 
      g: a.g  # gestein
      c: a.c  # circle
      x: a.v  # x (value von a)
      y: b.v  # y (value von b)
    #puts "#{obj.x}, #{obj.y}"
    return obj
  )

print_array = (arr) ->
  for el in arr
    string = ""
    for key, val of el
      string += "#{key} -> #{val}, " 
    puts "[#{string}]"

safe_as_file = (filename, obj) ->
  data = JSON.stringify(obj)
  fs.writeFileSync(filename, data, 'utf8')

sort_by_attr = (attr) ->
  obj_sort_func = (obj) ->
    return obj[attr]

median = (sorted_arr) ->
  size = sorted_arr.length
  if 1 == size % 2 #ungrade laenge des sorted_arrays
    median_point = Math.floor(size/2)
    return sorted_arr[median_point]
  else #grade laenge des sorted_arrays
    a = size / 2
    b = a - 1
    val_a = sorted_arr[a]
    val_b = sorted_arr[b]
    return (val_a+val_b) / 2 if _.isNumber(val_a)
    return [val_a,val_b]

features = (arr) ->
  n = arr.length
  {
    n : n
    min : arr[0]
    max : arr[n-1]
    median : median(arr)
  }


remove_top_percentile = (perc, arr) ->
  feat = features(arr)
  puts "#{feat.max.x}, #{feat.max.y}"
  k1 = 0
  k2 = Math.ceil(feat.n * (1 - perc) )
  return arr[k1..k2]


c = merge(a,b)
###
sortedX = _.sortBy(c, sort_by_attr('x'))
sortedY = _.sortBy(c, sort_by_attr('y'))

alpha = 0.03
cleanX = remove_top_percentile(alpha, sortedX)
cleanY = remove_top_percentile(alpha, sortedY)

clean = _.intersect(cleanX, cleanY)

puts "#{c.length}, #{cleanX.length}, #{cleanY.length}, #{clean.length}"

###



data = graph.createSegmentsForData(c, 10, 10)

#print_array(c)
safe_as_file(out_file, data)
