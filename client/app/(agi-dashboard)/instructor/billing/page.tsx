"use client"

import Header from "@/components/app-ui/agi-dashboard-ui/header"
import { Pagination } from "@/components/app-ui/pagination"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { formatPrice } from "@/lib/utils"
import { useGetMyTransactionsQuery } from "@/state/api"
import { useRouter, useSearchParams } from "next/navigation"

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data, isLoading, isFetching } = useGetMyTransactionsQuery({
    page,
    limit: 12,
  })

  const transactions = data?.transactions ?? []
  const pagination = data?.pagination

  if (isLoading) return <Spinner />

  return (
    <>
      <Header title="Billing" />

      {transactions.length === 0 ? (
        <EmptyCourseComponent
          title="No receipts yet"
          description="Purchases you complete will show up here."
        >
          <p>Enroll in a course to see your payment history.</p>
        </EmptyCourseComponent>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {transaction.course?.title ?? "Course"}
                    </td>
                    <td className="px-4 py-3">
                      {formatPrice(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {transaction.paymentProvider}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <Pagination
              page={pagination?.currentPage ?? page}
              totalPages={pagination?.totalPages ?? 1}
              isLoading={isFetching}
              onPageChange={(nextPage) =>
                router.push(`/user/billing?page=${nextPage}`)
              }
            />
          </div>
        </>
      )}
    </>
  )
}
