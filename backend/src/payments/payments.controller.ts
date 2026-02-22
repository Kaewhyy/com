import { Controller, Post, Body, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '../common/decorators/public.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('stripe/create-intent')
  async createStripeIntent(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createStripePaymentIntent(
      dto.orderId,
      dto.amount,
      dto.currency,
    );
  }

  @Post('razorpay/create-order')
  async createRazorpayOrder(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createRazorpayOrder(
      dto.orderId,
      dto.amount,
      dto.currency || 'INR',
    );
  }

  @Public()
  @Post('stripe/webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!rawBody) throw new Error('Raw body required for webhook');
    return this.paymentsService.verifyStripeWebhook(rawBody, signature);
  }

  @Public()
  @Post('razorpay/webhook')
  async razorpayWebhook(
    @Req() req: { body: string },
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    return this.paymentsService.verifyRazorpayWebhook(body, signature);
  }
}
