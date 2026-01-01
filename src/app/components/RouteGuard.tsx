'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import NotFound from '../not-found'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')

  const firstSegment = useMemo(() => {
    const parts = pathname.split('?')[0].split('#')[0].split('/').filter(Boolean)
    return parts[0] || ''
  }, [pathname])

  useEffect(() => {
    let active = true

    async function validate() {
      // Home is always valid
      if (firstSegment === '') {
        if (active) setStatus('valid')
        return
      }

      // Check authentication for accounts
      if (firstSegment === 'accounts') {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          // Store current URL for redirect after login
          if (typeof window !== 'undefined') {
            localStorage.setItem('redirectAfterLogin', pathname);
          }
          router.push('/auth');
          return;
        }
        if (active) setStatus('valid')
        return
      }

      // Known static segments are valid (handled by their own routes)
      if (firstSegment === 'journey' || firstSegment === 'projects' || firstSegment === 'contact' || firstSegment === 'admin' || firstSegment === 'admin-auth' || firstSegment === 'expertise' || firstSegment === 'blog' || firstSegment === 'newsletter' || firstSegment === 'privacy-policy' || firstSegment === 'terms-of-service'  || firstSegment === 'cookies-policy' || firstSegment === 'auth' || firstSegment === 'unsubscribe' || firstSegment === 'download-project') {
        if (active) setStatus('valid')
        return
      }

      // Any other route is invalid
      if (active) setStatus('invalid')
    }

    setStatus('checking')
    validate()
    return () => { active = false }
  }, [firstSegment])

  if (status === 'invalid') {
    return <NotFound />
  }

  // While checking, render children to avoid layout shift; invalid will replace with NotFound
  return <>{children}</>
}


