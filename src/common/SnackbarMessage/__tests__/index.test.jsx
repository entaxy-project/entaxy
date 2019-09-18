import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import ThemeProvider from '../../../core/ThemeProvider'
import { store } from '../../../store'
import SnackbarMessage from '..'

describe('SnackbarMessage', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <SnackbarMessage />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
