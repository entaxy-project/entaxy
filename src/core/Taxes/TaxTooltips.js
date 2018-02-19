import React from 'react'
import { Tooltip } from '@vx/tooltip';

export default ({ data, top, left, margin }) => {
  // console.log(data)
  // const xMax = width - margin.left - margin.right
  // const yMax = height - margin.top - margin.bottom

  return (
    <div>
      <Tooltip
        top={400}
        left={left}
        style={{transform: 'translateX(-50%)'}}
      >
        Income: {data.income}
      </Tooltip>
      <Tooltip
        top={top - 30}
        left={0}
        style={{
          backgroundColor: 'rgba(92, 119, 235, 1.000)',
          color: 'white'
        }}
      >
        Tax: {data.tax}
      </Tooltip>    
    </div>
  );
};