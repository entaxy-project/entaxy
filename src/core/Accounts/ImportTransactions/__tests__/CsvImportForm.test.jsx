import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { CsvImportFormComponent } from '../CsvImportForm'
import { DATE_FORMATS } from '../../../../store/transactions/CsvParsers/CsvParser'


// jest.mock('../../../../store/transactions/CsvParsers/CsvParser')
// const CsvParser = require('../../../../store/transactions/CsvParsers/CsvParser')

describe('CsvImportForm', () => {
  const mockHandleParsedData = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for BMO', () => {
    const component = renderer.create((
      <CsvImportFormComponent
        handleParsedData={mockHandleParsedData}
        onCancel={mockOnCancel}
        account={{ id: 1, institution: 'BMO' }}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    let instance
    let parseSpy
    let mapToTransactionsSpy
    let csvData

    beforeEach(() => {
      const wrapper = shallow((
        <CsvImportFormComponent
          handleParsedData={mockHandleParsedData}
          onCancel={mockOnCancel}
          account={{ id: 1, institution: 'BMO' }}
          classes={{ }}
        />
      ))
      instance = wrapper.instance()
      parseSpy = jest.spyOn(instance.parser, 'parse')
      mapToTransactionsSpy = jest.spyOn(instance.parser, 'mapToTransactions')
      csvData = [
        'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
        '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
        '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  '
      ]
    })

    it('should handleFileUpload', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      await instance.handleFileUpload([file])
      expect(parseSpy).toHaveBeenCalledWith(file)
      expect(instance.state).toEqual({
        file,
        error: null,
        csvHeader: instance.parser.csvHeader,
        dateFormat: instance.parser.dateFormat,
        isSubmitting: false
      })
      expect(instance.state.csvHeader.map(item => (item.label)).join()).toEqual(csvData[0])
    })

    it('should handleFileUpload for invalid file', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/xls' })
      await instance.handleFileUpload([file])
      expect(parseSpy).not.toHaveBeenCalled()
      expect(instance.state).toEqual({
        file: null,
        error: 'The file you uploaded is not a CSV file',
        csvHeader: null,
        dateFormat: null,
        isSubmitting: false
      })
    })

    it('should handleChange', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      await instance.handleFileUpload([file])
      expect(instance.state.csvHeader[3]).toEqual({
        label: ' Transaction Amount',
        sample: -650,
        transactionField: 'amount'
      })
      instance.handleChange({ target: { value: 'Don\'t import', name: 3 } })
      expect(instance.state.csvHeader[3]).toEqual({
        label: ' Transaction Amount',
        sample: -650,
        transactionField: 'Don\'t import'
      })
      instance.handleChange({ target: { value: 'amount', name: 3 } })
      expect(instance.state.csvHeader[3]).toEqual({
        label: ' Transaction Amount',
        sample: -650,
        transactionField: 'amount'
      })
    })

    it('should handleChangeDateFormat', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      await instance.handleFileUpload([file])
      expect(instance.parser.dateFormat).toEqual(Object.keys(DATE_FORMATS)[1])
      instance.handleChangeDateFormat({ target: { value: Object.keys(DATE_FORMATS)[0] } })
      expect(instance.parser.dateFormat).toEqual(Object.keys(DATE_FORMATS)[0])
      expect(instance.state.dateFormat).toEqual(Object.keys(DATE_FORMATS)[0])
    })

    it.skip('should handleChangeStartingRow', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      await instance.handleFileUpload([file])
      expect(instance.parser.dateFormat).toEqual(Object.keys(DATE_FORMATS)[1])
      instance.handleChangeStartingRow({ target: { value: Object.keys(DATE_FORMATS)[0] } })
      expect(instance.parser.dateFormat).toEqual(Object.keys(DATE_FORMATS)[0])
      expect(instance.state.dateFormat).toEqual(Object.keys(DATE_FORMATS)[0])
    })

    it('should handleSubmit', async () => {
      const mockEvent = { preventDefault: jest.fn() }

      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      await instance.handleFileUpload([file])
      instance.handleSubmit(mockEvent)
      expect(mapToTransactionsSpy).toHaveBeenCalled()
      expect(mockHandleParsedData).toHaveBeenCalled()
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })
})
