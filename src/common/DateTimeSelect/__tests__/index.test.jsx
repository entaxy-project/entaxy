import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'
import DateTimeSelect from '../'

describe('DateTimeSelect', () => {
  const mochOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <DateTimeSelect
        label="Date"
        name="createdAt"
        value={new Date('September 20th 11:36 a.m.')}
        onChange={mochOnChange}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  // it('handles checnges the date', () => {
  //   const wrapper = mount((
  //     <DateTimeSelect
  //       label="Date"
  //       name="createdAt"
  //       value={new Date('September 20th 11:36 a.m.')}
  //       onChange={mochOnChange}
  //     />
  //   ))
  //   console.log(wrapper)
  //   // expect(wrapper.find('button > span').text()).toBe('Login')
  //   // wrapper.find('button').simulate('click')
  //   // expect(mochHandleLogin).toHaveBeenCalled()
  //   // expect(mochHandleLogout).not.toHaveBeenCalled()
  // })
})
