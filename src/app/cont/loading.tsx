export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* header skeleton */}
      <div className="animate-pulse rounded-xl bg-white dark:bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* quick links skeleton */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="animate-pulse h-20 rounded-xl bg-white dark:bg-surface" />
        <div className="animate-pulse h-20 rounded-xl bg-white dark:bg-surface" />
      </div>

      {/* form sections skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mt-6 animate-pulse space-y-3 rounded-xl bg-white dark:bg-surface p-6">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  )
}
