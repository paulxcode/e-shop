export interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  group_id?: string | null
  featured_home?: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  images: string[]
  category_id: string | null
  group_id?: string | null
  stock: number
  featured: boolean
  rating: number
  specifications: Record<string, string>
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  address: Address | null
  role: 'customer' | 'admin'
  created_at: string
}

export interface CategoryGroup {
  id: string
  name: string
  slug: string
}

export interface Address {
  street: string
  city: string
  county: string
  zip: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_address: Address
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  product?: Product | null
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  user?: { full_name: string | null } | null
  is_verified_purchase?: boolean
}

export interface ReviewFormData {
  product_id: string
  rating: number
  comment: string
}

export interface ShippingMethod {
  id: string
  name: string
  description: string | null
  price: number
  estimated_days_min: number
  estimated_days_max: number
  active: boolean
  created_at: string
}

export type SortOption = 'pret-asc' | 'pret-desc' | 'rating-desc' | 'noutate'

export type AnalyticsEventType = 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'place_order'

export interface ReviewVote {
  id: string
  review_id: string
  user_id: string
  vote: boolean
  created_at: string
}

export interface CarouselSlide {
  id: string
  image_url: string
  title: string
  subtitle: string | null
  button_text: string | null
  link_type: 'category' | 'product' | 'custom'
  link_value: string
  sort_order: number
  is_active: boolean
  created_at: string
}

