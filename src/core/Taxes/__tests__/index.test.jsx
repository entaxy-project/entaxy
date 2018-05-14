import React from 'react'
import { shallow } from 'enzyme'
import { TaxesComponent } from '../'

describe('Taxes', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<TaxesComponent classes={{ rrsp: {} }} />)
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
