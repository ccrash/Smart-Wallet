import type { Product } from '@/types/product'
import type { Cart, CartItem } from '@/types/cart'
import type { OrderSummary } from '@/types/order'

export const makeProduct = (id: string, overrides: Partial<Product> = {}): Product => ({
  id,
  name: `Product ${id}`,
  description: `Description for ${id}`,
  price: 999,
  category: 'electronics',
  stock: { available: 10 },
  ...overrides,
})

export const makeCartItem = (productId: string, overrides: Partial<CartItem> = {}): CartItem => ({
  productId,
  productName: `Product ${productId}`,
  unitPrice: 999,
  quantity: 1,
  lineTotal: 999,
  ...overrides,
})

export const makeCart = (overrides: Partial<Cart> = {}): Cart => ({
  cartId: 'test-cart-id',
  status: 'ACTIVE',
  items: [],
  subtotal: 0,
  appliedDiscounts: [],
  discountTotal: 0,
  grandTotal: 0,
  expiresAt: '2099-01-01T00:00:00Z',
  ...overrides,
})

export const makeOrder = (overrides: Partial<OrderSummary> = {}): OrderSummary => ({
  orderId: 'test-order-id',
  cartId: 'test-cart-id',
  createdAt: '2025-01-01T00:00:00Z',
  items: [],
  subtotal: 0,
  appliedDiscounts: [],
  discountTotal: 0,
  totalPaid: 0,
  paymentStatus: 'SIMULATED_SUCCESS',
  ...overrides,
})
