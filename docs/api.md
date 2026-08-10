# API Documentation

## API style
The app uses Next.js route handlers in `src/app/api`. Most routes return JSON with a `success` flag, a `data` payload when relevant, and a `message` or `error` field for failures.

## Auth endpoints
- `POST /api/auth/signup` creates a user account and sends verification email.
- `POST /api/auth/login` signs the user in and issues tokens.
- `POST /api/auth/logout` clears the session.
- `GET /api/auth/me` returns the current authenticated user.
- `GET /api/auth/verify-email` verifies a signup token.

## Product endpoints
- `GET /api/product/get-products` lists products with pagination, category, price, search, seller, and sort filters.
- `GET /api/product/get-product/[id]` returns one product.
- `POST /api/product/create` creates a product for the signed-in seller.
- `PATCH /api/product/edit/[id]` updates a product.
- `DELETE /api/product/delete/[id]` removes a product.

## Cart endpoints
- `GET /api/cart/get` returns the current cart.
- `POST /api/cart/add` adds an item.
- `PATCH /api/cart/update` changes quantity.
- `DELETE /api/cart/remove` removes one line item.
- `DELETE /api/cart/clear` empties the cart.

## Order endpoints
- `POST /api/orders/checkout` creates an order from the current cart.
- `GET /api/orders/history` returns the signed-in user order history.
- `GET /api/orders/get-order/[id]` returns a single order.
- `PATCH /api/orders/update-status/[id]` updates order status for payment and admin flows.

## Review endpoints
- `GET /api/reviews/get-review/[productId]` returns reviews for one product.
- `POST /api/reviews/create` creates a review.
- `PATCH /api/reviews/update/[id]` updates a review.
- `DELETE /api/reviews/delete/[id]` deletes a review.

## Seller endpoints
- `GET /api/seller/get-seller` returns the current user's seller profile.
- `GET /api/seller/get-by-id/[id]` returns a seller profile by ID.
- `POST /api/seller/create` creates a seller profile.
- `PATCH /api/seller/edit` updates the current seller profile.
- `DELETE /api/seller/delete` removes the current seller profile.

## Other endpoints
- `POST /api/upload` handles blob uploads.

## Notes for consumers
- Most authenticated endpoints require the access token cookie.
- Frontend adapters normalize response shapes and surface friendly error messages.
- The payment page currently updates order status to paid as a frontend bridge, not a real payment gateway.