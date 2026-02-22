'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart } from '@/store/slices/cartSlice';
import type { RootState } from '@/store';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, total, isLoading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart() as never);
  }, [dispatch]);

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-16 text-center">Loading...</div>;

  if (!items?.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="mt-4 inline-block text-emerald-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <div className="space-y-4">
        {items.map((item: { id: string; quantity: number; product: { name: string; price: number; images?: { url: string }[] } }) => {
          const price = typeof item.product?.price === 'object' && (item.product.price as { toNumber?: () => number }).toNumber
            ? (item.product.price as { toNumber: () => number }).toNumber()
            : Number(item.product?.price ?? 0);
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border bg-white p-4">
              <div className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                {item.product?.images?.[0]?.url ? (
                  <Image src={item.product.images[0].url} alt="" width={80} height={80} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.product?.name}</h3>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(price * item.quantity).toFixed(2)}</p>
              <button onClick={() => dispatch(removeFromCart(item.id) as never)} className="text-red-600 hover:underline">
                Remove
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-8 border-t pt-8">
        <p className="text-xl font-bold">Total: ${Number(total || 0).toFixed(2)}</p>
        <Link href="/checkout" className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
