import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/cross-retail-analysis')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Atlas → Shopper
        </h1>
        <p className="text-gray-600">Redirecting to Cross Retail Analysis...</p>
      </div>
    </div>
  )
}
