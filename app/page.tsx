import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"


export default async function Home() {

  const data = await getServerSession(authOptions)

  return (
    <div>
      <h2>Server</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
