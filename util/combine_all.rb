program = "coffee big_picture.coffee"
indir   = "out"
outdir  = "out2"

min = 3
max = 45
for i in (min..max-1)
  for k in ((i+1)..max)
    system "#{program} #{indir}/#{i}.json #{indir}/#{k}.json #{outdir}/#{i}_#{k}.json"
  end
end