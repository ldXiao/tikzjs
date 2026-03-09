const { runWorker, SvgGenerator } = require('./dist/main')

const code = String.raw`\begin{tikzcd}[column sep=2em, row sep=3em]
  & {(W \otimes X) \otimes (Y \otimes Z)} \arrow[dr, "\alpha_{W,X,Y\otimes Z}"] & \\
  {((W \otimes X) \otimes Y) \otimes Z} \arrow[ur, "\alpha_{W\otimes X,Y,Z}"] \arrow[d, "\alpha_{W,X,Y} \otimes \mathrm{id}_Z"'] & & {W \otimes (X \otimes (Y \otimes Z))} \\
  {(W \otimes (X \otimes Y)) \otimes Z} \arrow[rr, "\alpha_{W,X\otimes Y,Z}"'] & & {W \otimes ((X \otimes Y) \otimes Z)} \arrow[u, "\mathrm{id}_W \otimes \alpha_{X,Y,Z}"']
\end{tikzcd}`

try {
  const ast = runWorker(code)
  const cd = ast._children[0]
  console.log('Rows:', cd._rows.length)
  cd._rows.forEach((row, r) => {
    row._cells.forEach((cell, c) => {
      console.log(`  cell[${r},${c}]: ${JSON.stringify(cell._content.slice(0,40))} arrows: [${cell._arrows.map(a => a._direction)}]`)
    })
  })
  const gen = new SvgGenerator()
  const svg = gen.render(ast)
  console.log('SVG length:', svg.length, '-- OK')
} catch(e) {
  console.error('Error:', e.message?.slice(0, 400))
}
