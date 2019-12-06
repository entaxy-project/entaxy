import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { store } from '../../../store'
import ThemeProvider from '../../ThemeProvider'
import ImportFromInstitutionForm from '../form'

// jest.mock('../formFields', () => 'InstitutionFormFields')
describe.skip('Account form', () => {
  const mochHandleSubmit = jest.fn()
  const mochHandleChange = jest.fn()
  const mochHandleCancel = jest.fn()
  const mochHandleDelete = jest.fn()
  const accountGroup = {
    id: 'g1',
    apiKey: 'abc',
    apiSecret: 'def',
    accountIds: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for regular account', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ImportFromInstitutionForm
          handleSubmit={mochHandleSubmit}
          values={{}}
          errors={{}}
          touched={{}}
          isSubmitting={false}
          handleChange={mochHandleChange}
          handleCancel={mochHandleCancel}
          handleDelete={mochHandleDelete}
          classes={{ }}
          institution="TD"
        />
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for new Coinbase account', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <ImportFromInstitutionForm
            handleSubmit={mochHandleSubmit}
            values={{}}
            errors={{}}
            touched={{}}
            isSubmitting={false}
            handleChange={mochHandleChange}
            handleCancel={mochHandleCancel}
            handleDelete={mochHandleDelete}
            classes={{ }}
            institution="Coinbase"
          />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for existing Coinbase account', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <ImportFromInstitutionForm
            handleSubmit={mochHandleSubmit}
            values={{}}
            errors={{}}
            touched={{}}
            isSubmitting={false}
            handleChange={mochHandleChange}
            handleCancel={mochHandleCancel}
            handleDelete={mochHandleDelete}
            classes={{ }}
            institution="Coinbase"
            accountGroup={accountGroup}
          />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
