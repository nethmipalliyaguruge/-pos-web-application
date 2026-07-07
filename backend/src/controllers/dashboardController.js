import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// @desc   Dashboard summary numbers
// @route  GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  // Add up all sale totals and count them (in one DB query)
  const salesAgg = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalSalesAmount: { $sum: "$total" },
        totalSales: { $sum: 1 },
      },
    },
  ]);

  const totalSalesAmount = salesAgg[0]?.totalSalesAmount || 0;
  const totalSales = salesAgg[0]?.totalSales || 0;

  // Count all products
  const totalProducts = await Product.countDocuments();

  // Find active products with stock less than 5
  const lowStockProducts = await Product.find({
    stock: { $lt: 5 },
    isActive: true,
  })
    .select("name sku stock")
    .sort({ stock: 1 }); // lowest stock first

  res.json({
    totalSalesAmount,
    totalSales,
    totalProducts,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
  });
};