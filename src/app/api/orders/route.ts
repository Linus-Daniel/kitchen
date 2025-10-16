import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";
import { emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const {
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      specialInstructions,
    } = await req.json();

    // Get user's cart
    const cart = await Cart.findOne({ user: user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      throw new ErrorResponse("Cart is empty", 400);
    }

    // Group items by vendor
    const vendorGroups: any = {};
    for (const item of cart.items) {
      const vendorId = item.product.vendor.toString();
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendor: vendorId,
          vendorName: item.product.vendorName,
          items: [],
          subtotal: 0,
          deliveryFee: item.product.deliveryFee || 0,
        };
      }
      vendorGroups[vendorId].items.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        price: item.price,
      });
      vendorGroups[vendorId].subtotal += item.price * item.quantity;
    }

    const vendorOrders = Object.values(vendorGroups);

    const order = await Order.create({
      user: user._id,
      orderItems: cart.items.map((item: any) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        price: item.price,
      })),
      vendorOrders,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      specialInstructions,
    });

    // Clear cart only for cash on delivery orders
    // For Paystack orders, cart will be cleared after successful payment verification
    if (paymentMethod === 'Cash on Delivery') {
      await Cart.findOneAndUpdate(
        { user: user._id },
        { $set: { items: [], totalPrice: 0 } }
      );
    }

    // Send email notifications
    try {
      // Get user details for email
      const userDetails = await User.findById(user._id);
      
      // Send order confirmation to customer
      if (userDetails?.email) {
        await emailService.sendOrderConfirmation(userDetails.email, order);
      }

      // Send new order notifications to vendors
      for (const vendorOrder of vendorOrders) {
        const vendor = await Vendor.findById((vendorOrder as any).vendor);
        if (vendor?.email) {
          await emailService.sendVendorOrderNotification(vendor.email, {
            ...order._doc,
            orderItems: (vendorOrder as any).items,
            user: userDetails
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "10") || 10;
    const status = searchParams.get("status");

    let query: any = { user: user._id };

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("orderItems.product", "name images")
      .populate("vendorOrders.vendor", "businessName")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: orders.length,
      total,
      data: orders,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}