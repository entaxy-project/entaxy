import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { store } from '../../../store'
import SnackbarMessage from '..'

describe('SnackbarMessage', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <Provider store={store}>
        <SnackbarMessage />
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
