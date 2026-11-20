// Pro learning content (drills, Spark cases, Python deep dives, Spark lessons).
// The files live in the private Supabase Storage bucket "pro", folder "content", uploaded by the private
// data-dhaba-pro repo. The bucket policy lets only accounts with Pro read them (supabase/payments.sql),
// so nothing here can be unlocked from the browser: without Pro the download is refused.
import { useEffect, useState } from 'react'
import { client } from './auth.js'
import { hasPro, TIER_EVENT } from './tier.js'

// Local preview builds only (never set in the site's deploy workflow): read the files from dist/pro-preview/.
const PREVIEW = import.meta.env.VITE_PRO_PREVIEW === 'on'
const cache = {}

async function download(name) {
  if (PREVIEW) {
    const r = await fetch(`${import.meta.env.BASE_URL}pro-preview/${name}`)
    if (!r.ok) throw new Error(`Preview file ${name} is missing.`)
    return r.json()
  }
  const sb = await client()
  if (!sb) throw new Error('Accounts are not set up on this site.')
  const { data, error } = await sb.storage.from('pro').download(`content/${name}`)
  if (error) throw new Error(/not.?found|400|403/i.test(error.message || '') ? 'Your account does not have Pro yet, or this content is still uploading. Try again in a minute.' : error.message)
  return JSON.parse(await data.text())
}

export function loadProContent(name) {
  if (!cache[name]) cache[name] = download(name).catch((e) => { delete cache[name]; throw e })
  return cache[name]
}

// Local preview builds can act as a Pro member to test these pages (the files still come from dist/pro-preview).
const isPro = () => hasPro() || (PREVIEW && (() => { try { return localStorage.getItem('dd:preview-pro') === '1' } catch (e) { return false } })())

export function usePro() {
  const [pro, setPro] = useState(isPro())
  useEffect(() => {
    const on = () => setPro(isPro())
    window.addEventListener(TIER_EVENT, on)
    return () => window.removeEventListener(TIER_EVENT, on)
  }, [])
  return pro
}

// { pro, data, err }: data is null until loaded, and stays null for learners without Pro. Pass null to load nothing.
export function useProContent(name) {
  const pro = usePro()
  const [state, setState] = useState({ data: null, err: '' })
  useEffect(() => {
    if (!pro || !name) { setState({ data: null, err: '' }); return }
    let live = true
    loadProContent(name).then((data) => live && setState({ data, err: '' })).catch((e) => live && setState({ data: null, err: e.message }))
    return () => { live = false }
  }, [pro, name])
  return { pro, ...state }
}
