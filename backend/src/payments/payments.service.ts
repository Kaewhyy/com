import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;
  private razorpay: Razorpay | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) this.stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });

    const rzpKey = this.config.get<string>('RAZORPAY_KEY_ID');
    const rzpSecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (rzpKey && rzpSecret) this.razorpay = new Razorpay({ key_id: rzpKey, key_secret: rzpSecret });
  }

  async createStripePaymentIntent(orderId: string, amount: number, currency = 'usd') {
    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Order not found');

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    await this.prisma.payment.create({
      data: {
        orderId,
        provider: PaymentProvider.STRIPE,
        providerPaymentId: intent.id,
        amount: order.total,
        currency: currency.toUpperCase(),
        status: 'PENDING',
      },
    });

    return { clientSecret: intent.client_secret };
  }

  async createRazorpayOrder(orderId: string, amount: number, currency = 'INR') {
    if (!this.razorpay) throw new BadRequestException('Razorpay not configured');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Order not found');

    const rzOrder = await this.razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: orderId,
    });

    await this.prisma.payment.create({
      data: {
        orderId,
        provider: PaymentProvider.RAZORPAY,
        providerPaymentId: rzOrder.id,
        amount: order.total,
        currency,
        status: 'PENDING',
      },
    });

    return {
      orderId: rzOrder.id,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
    };
  }

  async verifyStripeWebhook(payload: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !secret) return null;

    const event = this.stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.prisma.payment.updateMany({
        where: { providerPaymentId: paymentIntent.id },
        data: { status: 'COMPLETED' },
      });
      await this.prisma.order.updateMany({
        where: { id: paymentIntent.metadata.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    return event;
  }

  async verifyRazorpayWebhook(body: string, signature: string) {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) return null;

    const crypto = await import('crypto');
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) return null;

    const event = JSON.parse(body);
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await this.prisma.payment.updateMany({
          where: { providerPaymentId: payment.order_id },
          data: { status: 'COMPLETED' },
        });
      }
    }

    return event;
  }
}
