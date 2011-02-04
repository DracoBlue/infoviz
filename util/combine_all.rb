for i in (3..44)
  for k in ((i+1)..45)
    system "coffee zip-json-arrays.coffee out/#{i}.json out/#{k}.json out2/#{i}_#{k}.json"
  end
end