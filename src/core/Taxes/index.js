import React from 'react'
import { ParentSize } from "@vx/responsive";
import TaxChart from './TaxChart'

export default () => (
	<ParentSize>
    {parent => (
      <TaxChart 
      	year={2017}
        width={parent.width}
        height={500}
			/>)
		}
	</ParentSize>
)
