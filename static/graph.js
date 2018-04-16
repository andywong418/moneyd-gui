;(async function () {
  const width = 960
  const height = 500

  console.log('creating svg')
  const svg = d3.select('#svg').append('svg')
    .attr('width', width)
    .attr('height', height)

  console.log('creating force graph')
  const force = d3.layout.force()
    .gravity(0.05)
    .distance(150)
    .charge(-400)
    .size([ width, height ])

  console.log('fetching graph data')
  const req = await fetch('/actions/graph')

  if (req.status !== 200) {
    throw new Error('failed to load network graph')
  }

  const json = await req.json()
  console.log('creating graph. json=', JSON.stringify(json, null, 2))

  force
    .nodes(json.nodes)
    .links(json.links)
    .start()

  const link = svg.selectAll('.link')
    .data(json.links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .style('stroke-width', d => Math.sqrt(d.weight))

  const node = svg.selectAll('.node')
    .data(json.nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(force.drag)

  const radius = 5
  node.append('circle')
    .attr('r', radius)

  node.append('text')
    .attr('dx', 12)
    .attr('dy', '0.35em')
    .text(d => d.name)

  force.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node
      .attr('transform', d => {
        const nx = Math.max(radius, Math.min(width - radius, d.x))
        const ny = Math.max(radius, Math.min(height - radius, d.y))
        return `translate(${nx},${ny})`
      })
  })
})()