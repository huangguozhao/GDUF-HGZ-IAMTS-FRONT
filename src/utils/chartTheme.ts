export const PRIMARY_BLUE = '#409eff'
export const LIGHT_BLUE = '#e6f4ff'
export const TEXT_PRIMARY = 'var(--color-primary, #303133)'

export function donutOption(percentage) {
  return {
    series: [
      {
        type: 'pie',
        radius: ['70%', '90%'],
        avoidLabelOverlap: false,
        hoverAnimation: false,
        label: { show: false },
        emphasis: { scale: false },
        data: [
          { value: percentage, itemStyle: { color: PRIMARY_BLUE } },
          { value: 100 - percentage, itemStyle: { color: LIGHT_BLUE } }
        ]
      }
    ]
  }
}

export function sparklineOption(data = []) {
  return {
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        areaStyle: { color: LIGHT_BLUE, opacity: 0.6 },
        lineStyle: { color: PRIMARY_BLUE, width: 2 }
      }
    ]
  }
}


