import React from 'react'
import { mount } from 'enzyme'
import TaxChart from '../TaxChart'

describe('TaxChart', () => {
  it('matches snapshot', () => {
    const wrapper = mount((
      <TaxChart
        parentWidth={100}
        parentHeight={100}
        country="Canada"
        year={2017}
        region="Ontario"
        income={10000}
        rrsp={0}
        taxBeforeCredits={10000}
      />
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
