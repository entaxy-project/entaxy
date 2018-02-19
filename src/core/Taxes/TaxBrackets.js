import React from 'react'
import { Line } from '@vx/shape';
import { Point } from '@vx/point';

export const TaxBracketData = ({year, min = 0, max = 250000, step = 1000}) => {
	let data = []
	for (var income = min; income < max; income += step) {
		data.push({
			income: income, 
			tax: calculateTax(year, income)
		})
	}
	return data
}

const TaxBrackets = {
	2017: [
		{amountUpTo: 11635.00, tax: 0},
		{amountUpTo: 46605.00, tax: 15.00},
		{amountUpTo: 93208.00, tax: 20.50},
		{amountUpTo: 144489.00, tax: 26.00},
		{amountUpTo: 205842.00, tax: 29.00},
		{amountUpTo: null, tax: 33.00}
	]
}

const calculateTax = (year, income) => {
	let tax = 0

	for(var b = 0; b < TaxBrackets[year].length; b++) {
		var bracket = TaxBrackets[year][b]

		if(bracket.tax === 0) {
			if(income < bracket.amountUpTo) {
				break
			}
		} else {
			var prevBracketAmount = TaxBrackets[year][b-1].amountUpTo
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

export const TaxBracketLines = (year, xScale, yScale, margin, width, height) => {
	const rows = []
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

	for(var b = 1; b < TaxBrackets[year].length; b++) {
		var bracket = TaxBrackets[year][b]
		var key = "bracket-" + b

		rows.push(
	    <g key={"g-" + key}>
	      <Line
	        key={"vertical-" + key}
	        from={new Point({
	          x: xScale(bracket.amountUpTo), 
	          y: yMax
	        })}
	        to={new Point({
	          x: xScale(bracket.amountUpTo), 
	          y: 0
	        })}
	        stroke='#ffdddd'
	        strokeWidth={1}
	      />
	      <Line
	        key={"horizontal-" + key}
	        from={new Point({
	          x: 0, 
	          y: yScale(calculateTax(year, bracket.amountUpTo)) 
	        })}
	        to={new Point({
	          x: xMax, 
	          y: yScale(calculateTax(year, bracket.amountUpTo)) 
	        })}
	        stroke='#ffdddd'
	        strokeWidth={1}
	      />
	    </g>
		)
	}
	return rows
}
