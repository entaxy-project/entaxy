import { JSDOM } from 'jsdom'
import render from './../render'

describe('render', () => {
  it('renders without crashing', () => {
    const { document } = new JSDOM('<!doctype html><html><body><div id=\'root\'></div></body></html>').window

    render(document)
    expect(document.getElementById('root')._reactRootContainer).toBeTruthy()
  })
})
