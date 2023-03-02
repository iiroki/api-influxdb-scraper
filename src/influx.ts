import { Point } from '@influxdata/influxdb-client'
import at from 'lodash.at'
import { InfluxBindingConfig } from './model'

export const transform = (data: any, config: InfluxBindingConfig): Point => {
  const { measurement, tags, fields } = config
  const point = new Point(measurement).timestamp(new Date())

  // Tags
  tags.forEach(t => {
    if (t.value) {
      point.tag(t.out, t.value)
    } else if (t.in) {
      const values = at(data, t.in)
      if (values.length) {
        point.tag(t.out, values[0])
      }
    }
  })

  // Fields
  fields.forEach(f => {
    const values = at(data, f.in)
    if (values.length > 0 && values[0] !== undefined) { // TODO: Log warning if undefined
      const value = values[0]
      if (f.type === 'int') {
        point.intField(f.out, value)
      } else if (f.type === 'float') {
        point.floatField(f.out, value)
      } else if (f.type === 'string') {
        point.stringField(f.out, value)
      }
    }
  })

  return point
}