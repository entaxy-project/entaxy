/* eslint-disable import/prefer-default-export */
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

export const mochFetch = (response = '', status = 200) => {
  window.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve(new window.Response(
      JSON.stringify(response), {
        status,
        headers: { 'Content-type': 'application/json' }
      }
    ))
  ))
}
