import { Suspense } from "react"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { Link, usePaginatedQuery, useRouter, BlitzPage, Routes, useMutation, Router } from "blitz"
import getJobs from "app/jobs/queries/getJobs"
import { Spinner } from "app/core/components/Spinner"

const ITEMS_PER_PAGE = 3

export const JobsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ jobs, hasMore }] = usePaginatedQuery(getJobs, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <Link href={Routes.ShowJobPage({ jobId: job.id })}>
              <a>{job.position}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  console.log(currentUser)

  if (currentUser) {
    return (
      <>
        <button
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link href={Routes.SignupPage()}>
          <a>
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a>
            <strong>Login</strong>
          </a>
        </Link>
      </>
    )
  }
}

const Home: BlitzPage = () => (
  <main>
    <div className="buttons" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      <Suspense fallback={<Spinner />}>
        <UserInfo />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <JobsList />
      </Suspense>
    </div>
  </main>
)

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
