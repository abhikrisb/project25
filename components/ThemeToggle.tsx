'use client'

import { useEffect, useState } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'
import emailjs from '@emailjs/browser'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark')

    // try {
    //   await emailjs.send(
    //     "service_i79g9sh",
    //     "template_dgos5uf",
    //     {
    //       from_name: 'AcadAssist',
    //       to_email: '3idiotgamingkkv@gmail.com',
    //       subject: 'Theme Changed',
    //       message: `Theme was changed to ${newTheme} mode`
    //     },
    //     "hLk66sMCt6ZT9-pxR"
    //   )
    //   console.log('Email sent successfully')
    // } catch (error) {
    //   console.error('Failed to send email:', error)
    // }
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full
        bg-white dark:bg-gray-800 
        hover:bg-gray-100 dark:hover:bg-gray-700
        shadow-lg dark:shadow-gray-900/30
        transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <FaSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FaMoon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}