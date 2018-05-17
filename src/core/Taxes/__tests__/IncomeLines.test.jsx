import React from 'react'
import renderer from 'react-test-renderer'
import IncomeLines from '../IncomeLines'

describe('IncomeLines', () => {
  it('matches snapshot', () => {
    const margin = {
      top: 20,
      bottom: 40,
      left: 70,
      right: 0
    }
    const xScaleMoch = jest.fn()
    const yScaleMoch = jest.fn()
    const component = renderer.create((
      <IncomeLines
        income={100}
        country="Canada"
        year={2017}
        region="Ontario"
        xScale={xScaleMoch}
        yScale={yScaleMoch}
        margin={margin}
        height={100}
        classes={{ rrsp: {} }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
