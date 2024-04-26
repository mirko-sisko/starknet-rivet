import { useState, useEffect } from 'react'

import './Popup.css'
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts'
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand'
import { connect } from 'get-starknet'

export const Popup = () => {
  const [count, setCount] = useState(0)
  const link = 'https://github.com/guocaoyi/create-chrome-ext'

  const minus = () => {
    if (count > 0) setCount(count - 1)
  }

  const add = () => setCount(count + 1)

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCount(result.count || 0)
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ count })
    chrome.runtime.sendMessage({ type: 'COUNT', count })
  }, [count])

  return (
    <main>
      <h3>Popup Page</h3>
      <DockerCommandGenerator />
      <button onClick={() => connect()}>Connect wallet</button>
      <a href={link} target="_blank">
        generated by create-chrome-ext
      </a>
      <PredeployedAccounts />
    </main>
  )
}

export default Popup
