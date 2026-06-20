import { createContext, useContext, useState, useEffect } from 'react'
import { makeT } from './translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'fr'
    return localStorage.getItem('tlm_lang') || (navigator.language?.startsWith('en') ? 'en' : 'fr')
  })

  useEffect(() => {
    localStorage.setItem('tlm_lang', lang)
  }, [lang])

  const t = makeT(lang)
  const toggle = () => setLang(l => (l === 'fr' ? 'en' : 'fr'))

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) return { lang: 'fr', t: (k) => k, toggle: () => {}, setLang: () => {} }
  return ctx
}
