import React from 'react'
import Routes from '../../routes'
import ThemeProvider from '../ThemeProvider'

const App = () => (
  <ThemeProvider>
    <Routes />
  </ThemeProvider>
)

export default App
