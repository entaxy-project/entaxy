/* eslint-disable react/display-name */
import React from 'react'
import { Link } from 'react-router-dom'

export default (to) => (
  React.forwardRef((itemProps, ref) => (
    <Link to={to} {...itemProps} innerRef={ref} />
  ))
)
