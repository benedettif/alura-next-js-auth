import React from 'react'
import { useRouter } from 'next/router'
import { authService } from '../src/services/auth/authService'

export default function HomeScreen() {
  const router = useRouter()
  const [values, setValues] = React.useState({
    'user': 'tester',
    'password': 'safepassword',
  })

  function handleChange(event) {
    const fieldValue = event.target.value
    const fieldName = event.target.name

    setValues((currentValuee) => {
      return {
        ...currentValuee,
        [fieldName]: fieldValue,
      }
    })
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(event) => {
        event.preventDefault()
        authService.login({
          username: values.user,
          password: values.password
        })
          .then(() => {
            // router.push('/auth-page-ssr')
            router.push('/auth-page-static')
          })
          .catch(() => {
            alert('Usuário ou senha inválidos')
          })
      }}>
        <input
          placeholder="Usuário" 
          name="user"
          value={values.user}
          onChange={handleChange}
        />
        <input
          placeholder="Senha" 
          name="password" 
          type="password"
          value={values.password}
          onChange={handleChange}
        />

        <pre>{JSON.stringify(values, null, 2)}</pre>
        <div>
          <button>
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}
