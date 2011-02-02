puts = require('sys').puts
#Canvas = require 'Canvas'
fs = require 'fs'
_ = (require 'underscore')._ # this problem is fixed in underscore.js 1.1.3

#puts process.argv

i = 0
file_a  = process.argv[i++]
file_b  = process.argv[i++]
out_file= process.argv[i++]


{values: a} = JSON.parse(fs.readFileSync(file_a, 'utf8'))
{values: b} = JSON.parse(fs.readFileSync(file_b, 'utf8'))

###
a = [
  {v: 3.5, g:1, c:3}
  {v: 3.5, g:1, c:3}
  {v: 3.5, g:1, c:3}  
  ]

b = [
  {v: 0.5, g:1, c:3}
  {v: 0.5, g:1, c:3}
  {v: 0.5, g:1, c:3}  
  ]

###


merge = (a,b) ->
  _.map(_.zip(a,b), (x) ->
    [a, b] = x
    obj = 
      g: a.g
      c: a.c
      x: a.v
      y: b.v
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

make_obj = (arr) ->
  obj = 
    values: arr

###
for key, val of make_obj(merge(a,b))
  puts "#{key} -> #{val}" 
###

print_array(c = merge(a,b))
safe_as_file(out_file, make_obj(c))