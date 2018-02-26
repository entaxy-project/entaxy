import React from 'react'
import { Line } from '@vx/shape';
import { Point } from '@vx/point';

const TaxBrackets = {
	2017: {
		federal: [
			{amountUpTo: 11635.00, tax: 0},
			{amountUpTo: 46605.00, tax: 15.00},
			{amountUpTo: 93208.00, tax: 20.50},
			{amountUpTo: 144489.00, tax: 26.00},
			{amountUpTo: 205842.00, tax: 29.00},
			{amountUpTo: 10000000, tax: 33.00}
		],
		'Ontario': [
			{amountUpTo: 10171.00, tax: 0},
			{amountUpTo: 42960.00, tax: 5.05},
			{amountUpTo: 83923.00, tax: 9.15},
			{amountUpTo: 150000.00, tax: 11.16},
			{amountUpTo: 220000.00, tax: 12.16},
			{amountUpTo: 10000000, tax: 13.16}
		],
	}
}

// Return an array with income and corresponding tax
export const IncomeTaxData = ({year, province, income}) => {
	income = Number.parseFloat(income)
	const min = 0
	const max = income > 0 ? income + 25000 : 250000
	const step = 100

	let data = []
	let bracketIndex = 0
	for (var currIncome = min; currIncome < max; currIncome += step) {
		// Add the exact bracket ammount
		if(currIncome >= TaxBrackets[year][province][bracketIndex].amountUpTo) {
			data.push({
				income: TaxBrackets[year][province][bracketIndex].amountUpTo,
				tax: calculateTotalTax(year, province, TaxBrackets[year][province][bracketIndex].amountUpTo)
			})
			bracketIndex++;
		}

		data.push({
			income: currIncome,
			tax: calculateTotalTax(year, province, currIncome)
		})
	}
	return data
}

export const calculateTotalTax = (year, province, income) => {
	return calculateTax(year, 'federal', income) + calculateTax(year, province, income)
}

export const calculateTax = (year, province, income) => {
	let tax = 0

	for(var b = 0; b < TaxBrackets[year][province].length; b++) {
		var bracket = TaxBrackets[year][province][b]

		if(bracket.tax === 0) {
			if(income < bracket.amountUpTo) {
				break
			}
		} else {
			var prevBracketAmount = TaxBrackets[year][province][b-1].amountUpTo
			if(bracket.amountUpTo === null) {
				// Pay the higher tax for the rest of the incomde
				tax += (income - prevBracketAmount) * (bracket.tax / 100)
			} else if(income > bracket.amountUpTo) {
				// Pay the full amount for this bracket
				tax += (bracket.amountUpTo - prevBracketAmount) * (bracket.tax / 100)
			} else {
				// Pay only the difference
				tax += (income - prevBracketAmount) * (bracket.tax / 100)
				break
			}
		}
	}
	return tax
}

export const TaxBracketLines = (year, province, xScale, yScale, margin, width, height) => {
	const rows = []
  const yMax = height - margin.top - margin.bottom

	for(var b = 0; b < TaxBrackets[year][province].length; b++) {
		var left = xScale(TaxBrackets[year][province][b].amountUpTo)

		rows.push(
	      <Line
	        key={"vertical-" + b}
	        from={new Point({x: left, y: yMax})}
	        to={new Point({x: left, y: 0})}
	        stroke='#ffdddd'
	        strokeWidth={1}
	      />
		)
	}
	return  <g key={"TaxBracketLines"}>{rows}</g>
}
