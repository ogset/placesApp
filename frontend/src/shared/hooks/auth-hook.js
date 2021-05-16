import { useState, useCallback, useEffect } from 'react'

export const useAuth = () => {
  const [token, setToken] = useState(false)
  const [userId, setUserId] = useState(false)
  const [userName, setUserName] = useState('')

  const login = useCallback((uid, uName, token) => {
    setToken(token)
    setUserId(uid)
    setUserName(uName)
    localStorage.setItem(
      'userDataMrn',
      JSON.stringify({ userId: uid, userName: uName, token: token })
    )
  }, [])
  const logout = useCallback(() => {
    setToken(null)
    setUserId(null)
    setUserName(null)
    localStorage.removeItem('userDataMrn')
  }, [])

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userDataMrn'))
    if (storedData && storedData.token) {
      login(storedData.userId, storedData.userName, storedData.token)
    }
  }, [login])

  return { token, login, logout, userId, userName }
}
