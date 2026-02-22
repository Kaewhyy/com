import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.SUPER_ADMIN,
      isVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@ecommerce.com' },
    update: {},
    create: {
      email: 'user@ecommerce.com',
      passwordHash: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: Role.USER,
      isVerified: true,
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      isActive: true,
    },
  });

  const product = await prisma.product.upsert({
    where: { sku: 'SKU-001' },
    update: {},
    create: {
      categoryId: category.id,
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Premium wireless headphones with noise cancellation',
      shortDesc: 'Noise cancelling wireless headphones',
      sku: 'SKU-001',
      price: 99.99,
      comparePrice: 129.99,
      stock: 50,
      lowStockAlert: 5,
      isActive: true,
      isFeatured: true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: 'https://via.placeholder.com/400',
      alt: 'Wireless Headphones',
      sortOrder: 0,
    },
  }).catch(() => {});
    data: {
      productId: product.id,
      url: 'https://via.placeholder.com/400',
      alt: 'Wireless Headphones',
      sortOrder: 0,
    },
  }).catch(() => {});

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off for new customers',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 50,
      maxDiscount: 20,
      usageLimit: 100,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const existingAddress = await prisma.address.findFirst({
    where: { userId: user.id },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: user.id,
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        phone: '+1234567890',
        isDefault: true,
      },
    });
  }

  await prisma.cmsPage.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      title: 'About Us',
      content: '<p>Welcome to our e-commerce store.</p>',
      isActive: true,
    },
  });

  console.log('Seed completed!');
  console.log('Admin: admin@ecommerce.com / Admin@123');
  console.log('User: user@ecommerce.com / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
