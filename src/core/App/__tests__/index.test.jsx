import React from 'react'
import { shallow } from 'enzyme'
import App from '..'

jest.mock('../../../common/InstitutionIcon', () => 'InstitutionIcon')

describe('App', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<App />)
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
