import React from 'react'
import { mount } from 'enzyme'
import Input from 'material-ui/Input'
import CurrencyFormat from '../'

describe('CurrencyFormat', () => {
  it('formats numbers to currency', () => {
    const wrapper = mount(<Input value={0} inputComponent={CurrencyFormat} />)
    expect(wrapper.find('input').prop('value')).toEqual('$0')

    wrapper.setProps({ value: 100 }).mount()
    expect(wrapper.find('input').prop('value')).toEqual('$100')

    wrapper.setProps({ value: 1000 }).mount()
    expect(wrapper.find('input').prop('value')).toEqual('$1,000')

    wrapper.setProps({ value: 0.1 }).mount()
    expect(wrapper.find('input').prop('value')).toEqual('$0.1')

    wrapper.setProps({ value: 1000.50 }).mount()
    expect(wrapper.find('input').prop('value')).toEqual('$1,000.5')
  })
})
