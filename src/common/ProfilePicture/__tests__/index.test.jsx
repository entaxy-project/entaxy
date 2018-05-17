import React from 'react'
import renderer from 'react-test-renderer'
import store from '../../../store'
import ProfilePicture from '../'

describe('ProfilePicture', () => {
  it('matches snapshot with logged out user', () => {
    const component = renderer.create(<ProfilePicture store={store} />)
    expect(component.toJSON()).toBeNull()
  })

  it('matches snapshot with logged in user profile', () => {
    // Set the store currenct state
    const fetchUserData = jest.fn(() => {
      return {
        type: 'FETCH_USER_DATA',
        payload: {
          isAuthenticated: true,
          username: 'username',
          name: 'Tester',
          pictureUrl: 'some url'
        }
      }
    })
    store.dispatch(fetchUserData())
    const component = renderer.create(<ProfilePicture store={store} />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
