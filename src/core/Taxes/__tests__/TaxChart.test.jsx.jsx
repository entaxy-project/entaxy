import React from 'react'
import renderer from 'react-test-renderer'
import TaxChart from '../TaxChart'

describe('TaxChart', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TaxChart />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
