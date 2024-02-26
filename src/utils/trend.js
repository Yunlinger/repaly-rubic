import { getValue } from '@/api/rtd'

var trendData = {}

var timer = null

export function startTrend() {
  clearInterval(timer)
  timer = setInterval(() => {
    for (const name in trendData) {
      const value = getValue(name)
      trendData[name] = trendData[name] || []
      trendData[name].unshift(value)
      if (trendData[name].length > 1000) {
        trendData[name] = trendData[name].slice(0, 600)
      }
    }
  }, 1000)
}

export function stopTrend() {
  clearInterval(timer)
}

export function getTrendData(name) {
  const data = trendData[name]
  if (data) {
    return data
  }
  trendData[name] = []
  return []
}
