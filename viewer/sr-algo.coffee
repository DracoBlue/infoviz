puts = require('sys').puts

expand_range = (min, max, percent) ->
  size = max-min
  expand_by = (size/100)*percent
  return {min: min - expand_by, max: max + expand_by}


lg = (x) ->
  Math.log(x)/Math.log(10)

round_nearest = (lg_ticks) ->
  [floor, ceil] = [Math.floor(lg_ticks), Math.ceil(lg_ticks)]

  best = undefined
  min_dist = 100000

  for x in [0.301, 0.699]
    for y in [floor, ceil]
      cand = x+y
      #puts "candidate #{cand} for #{lg_ticks}"
      abs = Math.abs(cand-lg_ticks)
      if abs < min_dist
        best = cand
        min_dist = abs
  #puts "best = #{best}"
  return best


#test = expand_range(99, 799, 3)
#puts "99-799 bei 3% = #{test.min} - #{test.max}" 

#2. calculate range of scale

diff_between_ticks = (range, sr, ticks) ->
  #puts "range #{range.min}-#{range.max}"
  range = expand_range(range.min, range.max, sr)
  #puts "range #{range.min}-#{range.max}"
  ticks_size = (range.max - range.min) / ticks
  #puts "ticks_size = #{ticks_size} \t lg-ticks #{lg(ticks_size)}"
  return Math.round(Math.pow(10, round_nearest(lg(ticks_size))))


range =
  min: 99
  max: 799
sr = 3
ticks = 5

puts diff_between_ticks(range, sr, ticks)