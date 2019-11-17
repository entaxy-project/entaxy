import React, { useState, useEffect, useCallback } from 'react'
import confirm from './confirm'

const useKeyboardCommand = (command, action) => {
  const [code, setCode] = useState('')

  const handleKeydown = useCallback((event) => {
    const regex = RegExp(`^${code + event.key}`)
    if (command === code + event.key) {
      confirm(<span>Run <code>{command}</code> command.</span>, 'Are you sure?').then(async () => {
        action()
        setCode('')
      })
    } else if (regex.test(command)) {
      setCode((prevCode) => prevCode + event.key)
    } else {
      setCode('')
    }
  }, [code, command, action])

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [handleKeydown])
}

export default useKeyboardCommand
