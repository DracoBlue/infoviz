# Beispiel-Aufruf: 
# coffee schichten.coffee test.png 500 100 FF0000 1 FFFF00 499 000FFF
# => erzeugt ein Bild test.png 500x100 mit 1px links ROT, ganz viel GELB und rechts 1px BLAU
# => letzte Farbe geht immer bis zum Ende

Canvas = require 'Canvas'
fs = require 'fs'

#console.log process.argv
i = 0
filename  = process.argv[i++] || 'test.png'
width     = Number(process.argv[i++]) || 500
height    = Number(process.argv[i++]) || 1

rest = process.argv[i...process.argv.length]


canvas = new Canvas(width,height)
ctx  = canvas.getContext('2d')

out = fs.createWriteStream(__dirname + '/' + filename)
stream = canvas.createPNGStream();

paint = (ctx, color, width) ->
  ctx.fillStyle = color
  ctx.fillRect(0,0,width,height)
  

stream.on 'data', (chunk) ->
  out.write(chunk)


# falls die farbe zuletzt kommt, noch die normale länge dranhöngen
if 1 == rest.length % 2 
  rest.push(width)

#jetzt sind das immer Paare: (farbe, breite)
for i in [((rest.length-2)/2)..0]
  color = '#'+rest[i*2]
  paint(ctx, color, Number(rest[i*2 +1]))
