import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import { BrowserRouter, Redirect } from 'react-router-dom'
import { store } from '../store'
import ThemeProvider from '../core/ThemeProvider'
import { initialState as userInitialState } from '../store/user/reducer'
import { initialState as settingsInitialState } from '../store/settings/reducer'
import { initialState as accountsInitialState } from '../store/accounts/reducer'
import { RoutesComponent } from '../routes'
import Header from '../common/Header'

jest.mock('../common/InstitutionIcon', () => 'InstitutionIcon')

const FakeComponent = () => (<div />)

describe('Routes', () => {
  describe('snapshot', () => {
    it('matches with no accounts', () => {
      const component = renderer.create((
        <Provider store={store}>
          <ThemeProvider>
            <BrowserRouter>
              <RoutesComponent
                user={userInitialState}
                settings={settingsInitialState}
                accounts={accountsInitialState}
                classes={{ }}
              />
            </BrowserRouter>
          </ThemeProvider>
        </Provider>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })
  })

  describe('loginRequired', () => {
    it('Should redirect if user is not authenticated', () => {
      const wrapper = shallow((
        <RoutesComponent
          user={userInitialState}
          settings={settingsInitialState}
          accounts={accountsInitialState}
          classes={{ }}
        />
      ))
      const instance = wrapper.instance()

      expect(instance.props.user.isAuthenticatedWith).toBeNull()
      expect(instance.loginRequired(FakeComponent)()).toEqual(<Redirect to="/" />)
    })

    it('Should render component with no options', () => {
      const wrapper = shallow((
        <RoutesComponent
          isAuthenticatedWith="blockstack"
          settings={settingsInitialState}
          accounts={accountsInitialState}
          classes={{ }}
        />
      ))
      const instance = wrapper.instance()

      expect(instance.props.isAuthenticatedWith).toBeTruthy()
      expect(instance.loginRequired(FakeComponent)()).toEqual((
        <Header><FakeComponent /></Header>
      ))
    })

    it('Should redirect if there are no accounts', () => {
      const wrapper = shallow((
        <RoutesComponent
          isAuthenticatedWith="blockstack"
          settings={settingsInitialState}
          accounts={accountsInitialState}
          classes={{ }}
        />
      ))
      const instance = wrapper.instance()

      expect(instance.props.isAuthenticatedWith).toBeTruthy()
      expect(instance.loginRequired(FakeComponent, { accountRequired: true })()).toEqual((
        <Redirect to="/" />
      ))
    })

    it('Should render component when accounts required', () => {
      const wrapper = shallow((
        <RoutesComponent
          isAuthenticatedWith="blockstack"
          settings={settingsInitialState}
          accounts={{ byId: [{ id: 1 }] }}
          classes={{ }}
        />
      ))
      const instance = wrapper.instance()

      expect(instance.props.isAuthenticatedWith).toBeTruthy()
      expect(instance.loginRequired(FakeComponent, { accountRequired: true })()).toEqual((
        <Header><FakeComponent /></Header>
      ))
    })
  })
})
