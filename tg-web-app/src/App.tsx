import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>🚀 Telegram Mini App</h1>
        <h2>Приложение для знакомств</h2>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Счетчик: {count}
        </button>
        <p>
          Добро пожаловать в Telegram Mini App для знакомств!
        </p>
      </div>
      <p className="read-the-docs">
        Проект готов к развертыванию на TimeWeb Cloud
      </p>
    </>
  )
}

export default App