import { createServerSupabase } from "@/lib/supabase/server"
import { StarRating } from "./StarRating"
import { ReviewCard } from "./ReviewCard"
import { ReviewForm } from "./ReviewForm"
import type { Review } from "@/lib/types"

interface Props {
  productId: string
  userId?: string
}

export async function ReviewList({ productId, userId }: Props) {
  const supabase = await createServerSupabase()

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:users(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  let verifiedUserIds = new Set<string>()
  if ((reviews || []).length > 0) {
    const userIds = (reviews || []).map((r) => r.user_id)
    const { data: orderIds } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("product_id", productId)
    const orderIdSet = new Set((orderIds || []).map((o: any) => o.order_id))
    if (orderIdSet.size > 0) {
      const { data: orders } = await supabase
        .from("orders")
        .select("user_id")
        .in("id", Array.from(orderIdSet))
        .in("user_id", userIds)
        .gte("created_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      verifiedUserIds = new Set((orders || []).map((o: any) => o.user_id))
    }
  }

  const reviewsWithVerification: Review[] = (reviews || []).map((r) => ({
    ...r,
    is_verified_purchase: verifiedUserIds.has(r.user_id),
  }))

  const { data: existingReview } = userId
    ? await supabase
        .from("reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null }

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-semibold text-text">Recenzii</h2>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-text/70">
              ({reviews.length} {reviews.length === 1 ? "recenzie" : "recenzii"})
            </span>
          </div>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="mb-8 flex flex-col gap-3">
          {reviewsWithVerification.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="mb-6 text-sm text-text/70">
          Nu există recenzii încă. Fii primul care lasă o părere!
        </p>
      )}

      {userId && !existingReview && (
        <ReviewForm productId={productId} />
      )}
    </div>
  )
}
