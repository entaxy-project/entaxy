import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import store from '../../../../store'
import ThemeProvider from '../../../ThemeProvider'
import ImportedResults from '../ImportedResults'


describe('ImportedResults', () => {
  const mockOnSave = jest.fn()
  const mockOnBack = jest.fn()
  const account = {
    id: 1,
    name: 'Checking',
    institution: 'TD',
    currency: 'CAD'
  }
  let transactions = [{
    id: 1,
    accountId: 1,
    amount: 10,
    createAt: Date.now()
  }, {
    id: 2,
    accountId: 1,
    amount: -5,
    createAt: Date.now() + 10
  }]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.only('matches snapshot without errors', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <ImportedResults
            account={account}
            transactions={transactions}
            errors={{ base: [], transactions: [] }}
            onSave={mockOnSave}
            onBack={mockOnBack}
          />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with errors', () => {
    transactions.push({
      id: 3,
      accountId: 1,
      amount: 11,
      createAt: Date.now() + 11,
      errors: ['some error']
    })
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <ImportedResults
            classes={{ }}
            account={account}
            transactions={transactions}
            errors={{ base: [], transactions: [] }}
            onSave={mockOnSave}
            onBack={mockOnBack}
          />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    describe('filterByErrors', () => {
      const wrapper = shallow((
        <ImportedResults
          classes={{ }}
          account={account}
          transactions={transactions}
          errors={{ base: [], transactions: [] }}
          onSave={mockOnSave}
          onBack={mockOnBack}
        />
      ))
      const instance = wrapper.instance()

      it('should filter transactions with errors', () => {
        expect(instance.filterByErrors({})).toBeFalsy()
        expect(instance.filterByErrors({ errors: [] })).toBeFalsy()
        expect(instance.filterByErrors({ errors: ['some error'] })).toBeTruthy()
      })
    })

    describe('toolbarProps', () => {
      it('should return title with no errors', () => {
        transactions = [{
          id: 1,
          accountId: 1,
          amount: 10,
          createAt: Date.now()
        }]

        const wrapper = shallow((
          <ImportedResults
            classes={{ }}
            account={account}
            transactions={transactions}
            errors={{ base: [], transactions: [] }}
            onSave={mockOnSave}
            onBack={mockOnBack}
          />
        ))
        const instance = wrapper.instance()

        expect(instance.toolbarProps({})).toEqual({
          title: `Found ${transactions.length} transactions`,
          subTitle: 'No errors'
        })
      })

      it('should return title with errors', () => {
        transactions = [{
          id: 1,
          accountId: 1,
          amount: 10,
          createAt: Date.now()
        }, {
          id: 3,
          accountId: 1,
          amount: 11,
          createAt: Date.now() + 11,
          errors: ['some error']
        }]

        const wrapper = shallow((
          <ImportedResults
            classes={{ }}
            account={account}
            transactions={transactions}
            errors={{ base: [], transactions: [] }}
            onSave={mockOnSave}
            onBack={mockOnBack}
          />
        ))
        const instance = wrapper.instance()

        const props = instance.toolbarProps({})
        expect(Object.keys(props)).toEqual(['title', 'subTitle'])
        expect(props.title).toEqual(`Found ${transactions.length} transactions`)
        expect(props.subTitle).not.toEqual('No errors')
      })
    })

    describe('errorCellRenderer', () => {
      const wrapper = shallow((
        <ImportedResults
          classes={{ }}
          account={account}
          transactions={transactions}
          errors={{ base: [], transactions: [] }}
          onSave={mockOnSave}
          onBack={mockOnBack}
        />
      ))
      const instance = wrapper.instance()

      it('should render check circle icon when there are no errors', () => {
        const w = shallow(instance.errorCellRenderer({ cellData: [] }))
        expect(w.text()).toBe('<CheckCircleIcon />')
      })

      it('should render error icon when there are errors', () => {
        const w = shallow(instance.errorCellRenderer({ cellData: ['some error'] }))
        expect(w.find('Tooltip').children().text()).toBe('<pure(ErrorIcon) />')
      })
    })
  })
})
