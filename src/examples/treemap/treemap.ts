import * as d3 from 'd3'
import { formatType, handleErrors } from '../common/utils'

import {
  Row,
  Looker,
  VisualizationDefinition
} from '../types/types'

// Global values provided via the API
declare var looker: Looker

interface TreemapVisualization extends VisualizationDefinition {
  svg?: d3.Selection<SVGElement, {}, any, any>,
}

// recursively create children array
function descend(obj: any, depth: number = 0) {
  const arr: any[] = []
  for (const k in obj) {
    if (k === '__data') {
      continue
    }
    const child: any = {
      name: k,
      depth,
      children: descend(obj[k], depth + 1)
    }
    if ('__data' in obj[k]) {
      child.data = obj[k].__data
    }
    arr.push(child)
  }
  return arr
}

function burrow(table: Row[]) {
  // create nested object
  const obj: any = {}

  table.forEach((row: Row) => {
    // start at root
    let layer = obj

    // create children as nested objects
    row.taxonomy.value.forEach((key: any) => {
      layer[key] = key in layer ? layer[key] : {}
      layer = layer[key]
    })
    layer.__data = row
  })

  // use descend to create nested children arrays
  return {
    name: 'root',
    children: descend(obj, 1),
    depth: 0
  }
}

const vis: TreemapVisualization = {
  id: 'treemap',
  label: 'Treemap',
  options: {
    color_range: {
      type: 'array',
      label: 'Color Range',
      display: 'colors',
      default: ['green', 'red']
    }
  },
  // Set up the initial state of the visualization
  create: function (element, config) {
    this.svg = d3.select(element).append('svg')
  },
  // Render in response to the data or settings changing
  update: function (data, element, config, queryResponse) {
    if (!handleErrors(this, queryResponse, {
      min_pivots: 0, max_pivots: 0,
      min_dimensions: 1, max_dimensions: undefined,
      min_measures: 1, max_measures: 2
    })) return
    

    const width = element.clientWidth
    const height = element.clientHeight

    const dimensions = queryResponse.fields.dimensions
    const measures = queryResponse.fields.measure_like
    const calculated = queryResponse.fields.table_calculations
    
    if (measures.length === 1 && calculated.length === 0) {
        if (this && this.addError) {
      	  this.addError({
 			title: "Two Dimensions Required",
 			message: "missing a second measure or calculated field."
 			});
 		}
        return;
    }
    
    const rateField = measures[1] ? measures[1] : calculated[0]
    
    const format = formatType(measures[0].value_format) || ((s: any): string => s.toString())
    const formatRate = formatType(rateField.value_format) || ((s: any): string => s.toString())

    const colorScale: d3.ScaleOrdinal<string, null> = d3.scaleOrdinal()
    const color = colorScale.range(config.color_range)

    data.forEach((row: Row) => {
      row.taxonomy = {
        value: dimensions.map((dimension) => row[dimension.name].value)
      }
    })

    const treemap = d3.treemap()
      .size([width, height - 16])
      .tile(d3.treemapSquarify.ratio(1))
      .paddingOuter(1)
      .paddingTop((d) => {
        return d.depth === 1 ? 16 : 0
      })
      .paddingInner(1)
      .round(true)

    const svg = this.svg!
      .html('')
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', 'translate(0,16)')

    const breadcrumb = svg.append('text')
      .attr('y', -5)
      .attr('x', 4)

    const root = d3.hierarchy(burrow(data)).sum((d: any) => {
      return 'data' in d ? d.data[measures[0].name].value : 0
    })
    treemap(root)

    const cell = svg.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('transform', (d: any) => 'translate(' + d.x0 + ',' + d.y0 + ')')
      .attr('class', (d, i) => 'node depth-' + d.depth)
      .style('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('click', (d) => console.log(d))
      .on('mouseenter', (d: any) => {
        const ancestors = d.ancestors()
        breadcrumb.text(
          ancestors.map((p: any) => p.data.name)
            .slice(0, -1)
            .reverse()
            .join('-') + ': ' + format(d.value) 
        )
        svg.selectAll('g.node rect')
          .style('stroke', null)
          .filter((p: any) => ancestors.indexOf(p) > -1)
          .style('stroke', '#fff')
      })
      .on('mouseleave', (d) => {
        breadcrumb.text('')
        svg.selectAll('g.node rect')
          .style('stroke', (d) => {
            return null
          })
      })

    cell.append('rect')
      .attr('id', (d, i) => 'rect-' + i)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .style('fill', (d: any) => {
        if (d.depth === 0) return 'none'
        if (d.depth === 1) { 
           return '#999'
        } 
        const colors: any[] = ['green', 'red']
        const scale = d3.scaleLinear()
          .domain([0, 1])
          .range(colors)  
          
        const result = scale(((d && d.data && d.data.data && rateField && rateField.name && d.data.data[rateField.name]) ? d.data.data[rateField.name].value : 0) )  
        return result
      })

    cell.append('clipPath')
      .attr('id', (d, i) => 'clip-' + i)
      .append('use')
      .attr('xlink:href', (d, i) => '#rect-' + i)

    cell.append('text')
      .style('opacity', (d) => {
        if (d.depth === 1) return 1
        return 0
      })
      .attr('clip-path', (d, i) => 'url(#clip-' + i + ')')
      .attr('y', (d) => {
        return d.depth === 1 ? '13' : '10'
      })
      .attr('x', 2)
      .style('font-family', 'Helvetica, Arial, sans-serif')
      .style('fill', 'white')
      .style('font-size', (d) => {
        return d.depth === 1 ? '14px' : '10px'
      })
      .text((d) => d.data.name === 'root' ? '' : d.data.name)

  }
}

looker.plugins.visualizations.add(vis)
