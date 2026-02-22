# E-commerce Database ER Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   User      │     │  RefreshToken    │     │   Address    │
├─────────────┤     ├─────────────────┤     ├──────────────┤
│ id (PK)     │────<│ userId (FK)      │     │ id (PK)      │
│ email       │     │ token           │     │ userId (FK)   │
│ passwordHash│     │ expiresAt       │     │ street, city  │
│ firstName   │     └─────────────────┘     └──────────────┘
│ lastName    │
│ role        │     ┌─────────────────┐     ┌──────────────┐
│ googleId    │     │   Category      │     │   Product    │
└─────────────┘     ├─────────────────┤     ├──────────────┤
       │             │ id (PK)        │────<│ categoryId   │
       │             │ name, slug     │     │ name, slug   │
       │             │ parentId (FK)  │     │ sku, price   │
       │             └────────────────┘     │ stock        │
       │                                   └──────────────┘
       │             ┌─────────────────┐            │
       │             │  ProductImage   │            │
       │             ├─────────────────┤            │
       │             │ productId (FK)  │<───────────┘
       │             │ url             │
       │             └─────────────────┘
       │
       │             ┌─────────────────┐     ┌──────────────┐
       ├────────────>│     Cart        │     │  CartItem    │
       │             ├─────────────────┤     ├──────────────┤
       │             │ id (PK)         │────<│ cartId (FK)  │
       │             │ userId (FK)     │     │ productId   │
       │             │ couponId (FK)    │     │ quantity    │
       │             └─────────────────┘     └──────────────┘
       │
       │             ┌─────────────────┐     ┌──────────────┐
       ├────────────>│    Order        │     │  OrderItem   │
       │             ├─────────────────┤     ├──────────────┤
       │             │ orderNumber     │────<│ orderId (FK) │
       │             │ userId (FK)     │     │ productId    │
       │             │ addressId (FK)  │     │ price, qty   │
       │             │ status, total   │     └──────────────┘
       │             └────────────────┘
       │                        │
       │             ┌──────────┴──────────┐
       │             │      Payment         │
       │             ├─────────────────────┤
       │             │ orderId (FK)         │
       │             │ provider (Stripe/RP) │
       │             │ status, amount       │
       │             └──────────────────────┘
       │
       ├────────────>│    Wishlist      │
       │             ├─────────────────┤
       │             │ userId (FK)      │
       │             │ productId (FK)   │
       │             └─────────────────┘
       │
       └────────────>│    Review        │
                     ├─────────────────┤
                     │ productId (FK)   │
                     │ userId (FK)      │
                     │ rating, content │
                     └─────────────────┘
```

## Key Relations
- User → Cart (1:1)
- User → Orders (1:N)
- User → Wishlist (1:N)
- Product → Category (N:1)
- Order → OrderItems (1:N)
- Order → Payment (1:N)
