// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 30, left: 50, right: 15, bottom: 120 }

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom


svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

y = d3.scaleLinear()
          .range([alto, 0])

x = d3.scaleBand()
      .range([0, ancho])
      .paddingInner(0.1)
      .paddingOuter(0.3)

color = d3.scaleOrdinal()
          .range(d3.schemeDark2)

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

titulo = g.append('text')
          .attr('x', `${ancho / 2}px`)
          .attr('y', '-5px')
          .attr('text-anchor', 'middle')
          .attr('class', 'titulo-grafica')

dataArray = []


ENTIDAD_FEDERATIVA = 'todas'
ENTIDAD_FEDERATIVASelect = d3.select('#ENTIDAD_FEDERATIVA')

metrica = 'CREDITO_TRADICIONAL'
metricaSelect = d3.select('#metrica')

ascendente = false


function render(data) {

  bars = g.selectAll('rect')
            .data(data, d => d.ANIO)

  bars.enter()
      .append('rect')
        .style('width', '0px')
        .style('height', '0px')
        .style('y', `${y(0)}px`)
        .style('fill', '#000')
        .style('x', d => x(d.ANIO) + 'px')
      .merge(bars)
        .transition()

        .duration(2000)
          .style('x', d => x(d.ANIO) + 'px')
          .style('y', d => (y(d[metrica])) + 'px')
          .style('height', d => (alto - y(d[metrica])) + 'px')
          .style('fill', d => color(d.ENTIDAD_FEDERATIVA))
          .style('width', d => `${x.bandwidth()}px`)

  bars.exit()
      .transition()
      .duration(2000)
        .style('height', '0px')
        .style('y', d => `${y(0)}px`)
        .style('fill', '#000000')
      .remove()


  yAxisCall = d3.axisLeft(y)
                .ticks(3)
                .tickFormat(d => d + ((metrica == 'CREDITO_TRADICIONAL') ? 'm.' : ''))
  yAxisGroup.transition()
            .duration(2000)
            .call(yAxisCall)

  xAxisCall = d3.axisBottom(x)
  xAxisGroup.transition()
            .duration(2000)
            .call(xAxisCall)
            .selectAll('text')
            .attr('x', '-8px')
            .attr('y', '-5px')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
}


d3.csv('credTran.csv')
.then(function(data) {
  data.forEach(d => {
    d.ANIO = +d.ANIO
    d.CREDITO_TRADICIONAL = +d.CREDITO_TRADICIONAL
  })

  dataArray = data

  color.domain(data.map(d => d.ENTIDAD_FEDERATIVA))

 
  ENTIDAD_FEDERATIVASelect.append('option')
              .attr('value', 'todas')
              .text('Todas')
  color.domain().forEach(d => {
    console.log(d)
    ENTIDAD_FEDERATIVASelect.append('option')
                .attr('value', d)
                .text(d)
  })


  frame()
})
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

function frame() {
  dataframe = dataArray
  if (ENTIDAD_FEDERATIVA != 'todas') {
    dataframe = d3.filter(dataArray, d => d.ENTIDAD_FEDERATIVA == ENTIDAD_FEDERATIVA)
  }

  dataframe.sort((a, b) => {
    return ascendente ? d3.ascending(a[metrica], b[metrica]) : d3.descending(a[metrica], b[metrica])
 
  })


  maxy = d3.max(dataframe, d => d[metrica])

  y.domain([0, maxy])
  x.domain(dataframe.map(d => d.ANIO))

  render(dataframe)
}

ENTIDAD_FEDERATIVASelect.on('change', () => {
  ENTIDAD_FEDERATIVA = ENTIDAD_FEDERATIVASelect.node().value
  frame()
})

metricaSelect.on('change', () => {
  metrica = metricaSelect.node().value
  frame()
})

function cambiaOrden() {
  ascendente = !ascendente
  frame()
}