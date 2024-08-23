import { collections } from '../index.js';
import { db } from '../index.js';

export const salesGrowth = async(req,res)=>{
  try {
    const col = db.collection(collections[0].name);

    const monthlySales = await col.aggregate([
      {
        $addFields: {
          created_at: {
            $dateFromString: { dateString: "$created_at" }
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          totalSales: { $sum: { $toDouble: "$total_price" } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Calculate growth rate
    const growthRates = monthlySales.map((data, index, arr) => {
      if (index === 0) {
        return { month: data._id, growthRate: 0 };  // First month has no growth rate
      }
      const prevMonth = arr[index - 1];
      const growthRate = ((data.totalSales - prevMonth.totalSales) / prevMonth.totalSales) * 100;
      return { month: data._id, growthRate };
    });

    res.json(growthRates);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }

}
