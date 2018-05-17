import React from 'react'
import renderer from 'react-test-renderer'
import TaxChart from '../TaxChart'

describe('TaxChart', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <TaxChart
        parentWidth={500}
        parentHeight={500}
        country="Canada"
        year={2017}
        region="Ontario"
        income={100000}
        rrsp={1000}
        taxBeforeCredits={90000}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
