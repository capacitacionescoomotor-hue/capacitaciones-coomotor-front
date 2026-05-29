'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Login from './auth/Login'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])

  return <Login />
}
