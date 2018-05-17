import React from 'react'
import renderer from 'react-test-renderer'
import TaxBracketLines from '../TaxBracketLines'

describe('TaxBracketLines', () => {
  it('matches snapshot', () => {
    const margin = {
      top: 20,
      bottom: 40,
      left: 70,
      right: 0
    }
    const xScaleMoch = jest.fn()
    const component = renderer.create((
      <TaxBracketLines
        income={1000}
        country="Canada"
        year={2017}
        region="Ontario"
        xScale={xScaleMoch}
        margin={margin}
        width={100}
        height={100}
        classes={{ rrsp: {} }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
