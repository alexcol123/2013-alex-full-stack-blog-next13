'use client'

import { useSession } from "next-auth/react"

const ClientSessionTest = () => {

  const { data, status } = useSession()

  return (
    <div>
      <h2>Client</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default ClientSessionTest