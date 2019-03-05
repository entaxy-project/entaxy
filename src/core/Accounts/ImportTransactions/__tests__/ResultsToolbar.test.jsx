import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { BrowserRouter } from 'react-router-dom'
import { ResultsToolbarComponent } from '../ResultsToolbar'

describe('ResultsToolbar', () => {
  const account = { id: 1, name: 'Checking', institution: 'TD' }
  const mochaResetSelection = jest.fn()
  const mochaSetFilter = jest.fn()
  const mochaUnsetFilter = jest.fn()
  const mochaFilterTransactionsWithErrors = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no selected transactions', () => {
    const component = renderer.create((
      <BrowserRouter>
        <ResultsToolbarComponent
          classes={{}}
          title="Title"
          subTitle="subTitle"
          account={account}
          selectedTransactions={[]}
          resetSelection={mochaResetSelection}
          filterProps={{
            filters: {}
          }}
          filterTransactionsWithErrors={mochaFilterTransactionsWithErrors}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with some selected transactions', () => {
    const component = renderer.create((
      <BrowserRouter>
        <ResultsToolbarComponent
          classes={{}}
          title="Title"
          subTitle="subTitle"
          account={account}
          selectedTransactions={[1, 2]}
          resetSelection={mochaResetSelection}
          filterProps={{
            filters: {}
          }}
          filterTransactionsWithErrors={mochaFilterTransactionsWithErrors}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const wrapper = shallow((
      <ResultsToolbarComponent
        classes={{}}
        title="Title"
        subTitle="subTitle"
        account={account}
        selectedTransactions={[]}
        resetSelection={mochaResetSelection}
        filterProps={{
          filters: {},
          setFilter: mochaSetFilter,
          unsetFilter: mochaUnsetFilter
        }}
        filterTransactionsWithErrors={mochaFilterTransactionsWithErrors}
      />
    ))
    const instance = wrapper.instance()

    it('should set the value of showOnlyErrors', () => {
      instance.onChange({ target: { checked: true } })
      expect(mochaSetFilter).toHaveBeenCalledWith({
        attr: 'errors',
        value: true
      })
      expect(mochaUnsetFilter).not.toHaveBeenCalled()
    })

    it('should unset the value of showOnlyErrors', () => {
      instance.onChange({ target: { checked: false } })
      expect(mochaSetFilter).not.toHaveBeenCalled()
      expect(mochaUnsetFilter).toHaveBeenCalledWith({ attr: 'errors' })
    })
  })
})
