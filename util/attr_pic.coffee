Canvas = require 'Canvas'
fs = require 'fs'
_ = (require 'underscore')._ # this problem is fixed in underscore.js 1.1.3

#puts process.argv
i = 0
val_file =  process.argv[i++]
img_file =  process.argv[i++] || "#{val_file}.png"
conf_file = process.argv[i++] || 'config.json'


config = JSON.parse(fs.readFileSync(conf_file, 'utf8'))
colors = []
_.each(config.schichten.layers, (obj) -> colors[obj.id-1] = obj.color) 


json = fs.readFileSync(val_file, 'utf8')
values = JSON.parse(json)['values']


test = [
  {'v' : 2}
  {'v' : 4}
  {'v' : 3}
  {'v' : 1}  
]


sort_by_attr = (attr) ->
  obj_sort_func = (obj) ->
    return obj[attr]


sorted = _.sortBy values, sort_by_attr('v')

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


puts("Fehler in median") unless 2.5 == median([1,2,3,4])
puts("Fehler in median") unless 3 == median([1,2,3,4,5])

features = (arr) ->
  n = arr.length
  {
    n : n
    min : arr[0]
    max : arr[n -1]
    median : median(arr)
  }


# entfernen der obersten 5% quantile 
f = features(sorted)
alpha = 0.05
#k1 = Math.ceil(f.n * alpha)
k1 = Math.ceil(0)
k2 = Math.ceil(f.n * (1 - alpha) )

ohne_extreme = sorted[k1..k2]

f = features(ohne_extreme)
#puts('count: ' + f.n)
#puts('Min: ' + JSON.stringify(f.min))
#puts('Max: ' + JSON.stringify(f.max))
#puts('Median: ' + f.median)


min = f.min.v
inc = (f.max.v - f.min.v) / 100.0 

between = (attr, min, max) ->
  between_func = (obj) ->
    min <= obj[attr] <= max

filter_by_attr = (attr, val) ->
  '''
  attribute needs to equal (==) value
  '''
  filter = (obj) ->
    obj[attr] == val
  



percentify = (arr) ->
  sum = (memo, num) -> memo + num
  total = _.reduce(arr, sum, 0)

  percent = (x) ->
    return 0 if 0 == total
    Math.round( x/total * 100 )
    
  _.map(arr, percent)


puts "Fehler bei percentify" unless _.isEqual([10,20,30,40] , percentify([1,2,3,4]))

per_color = [0..99][0..4]

for step in [0..99]
  from = step * inc + min
  to = from + step
  x = _.filter(ohne_extreme, between('v', from, to))
  #puts "#{from} .. #{to} -> #{x.length}"

  per_color[step] = [0,0,0,0,0]
  for v in x
    per_color[step][v.g-1] += 1

  per_color[step] = percentify(per_color[step])
  #puts "#{from} .. #{to} -> #{x.length} (#{per_color[step][0]}, #{per_color[step][1]}, #{per_color[step][2]}, #{per_color[step][3]}, #{per_color[step][4]})"


############ ...
##
## und jetzt wird alles gezeichnet...
##
############ ...

canvas = new Canvas(100,100)
ctx  = canvas.getContext('2d')
out = fs.createWriteStream("#{__dirname}/#{img_file}")
stream = canvas.createPNGStream();
stream.on 'data', (chunk) -> out.write(chunk)


draw = (arr) ->  
  i = 0
  for row in arr
    j = 0
    start = 0
    for schicht in row
      ctx.fillStyle = "##{colors[j]}"
      ctx.strokeStyle = "##{colors[j]}"
      ctx.fillRect(start,99-i,schicht,1)
      start += schicht
      j++
    i++
  ctx.stroke


draw(per_color)

# puts('done')
