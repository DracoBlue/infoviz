Canvas = require 'Canvas'
fs = require 'fs'
_ = (require 'underscore')._ # this problem is fixed in underscore.js 1.1.3

#puts process.argv
i = 0
filename  = process.argv[i++]

json = fs.readFileSync(filename, 'utf8')
values = JSON.parse(json)['values']


test = [
  {'v' : 2}
  {'v' : 4}
  {'v' : 3}
  {'v' : 1}  
]


# currying
extract = (attr) ->
  extract_attr = (v) ->
    v[attr]
  
sort_func = (num) ->
  return num

sort_by_attr = (attr) ->
  obj_sort_func = (obj) ->
    return obj[attr]




#arr = _.map(values,extract('v'))
#sorted = _.sortBy arr, sort_func

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

f = features(sorted)
#puts('count: ' + f.n)
#puts('Min: ' + JSON.stringify(f.min))
#puts('Max: ' + JSON.stringify(f.max))
#puts('Median: ' + f.median)

puts('entfernen der unteren und oberen 5% quantile')
alpha = 0.05
k1 = Math.ceil(f.n * alpha)
k2 = Math.ceil(f.n * (1 - alpha) )

ohne_extreme = sorted[k1..k2]

f = features(ohne_extreme)
puts('count: ' + f.n)
puts('Min: ' + JSON.stringify(f.min))
puts('Max: ' + JSON.stringify(f.max))
puts('Median: ' + f.median)


for [1..100]

puts('done')
