declare module 'react-heatmap-grid' {
  import { FC } from 'react'

  interface HeatMapProps {
    xLabels: string[]
    yLabels: string[]
    data: number[][]
    cellStyle?: (background: string, value: number, min: number, max: number) => React.CSSProperties
    cellRender?: (value: number) => React.ReactNode
    title?: (value: number) => string
  }

  const HeatMap: FC<HeatMapProps>
  export default HeatMap
} 