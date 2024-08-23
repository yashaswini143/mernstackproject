import { collections } from '../index.js';
import { db } from '../index.js';

export const salesOverTime = async(req,res)=>{
  try {
    const col = collections[0].name;
    const data = db.collection(col);;
    const salesData = await data.aggregate([
      {
        $addFields: {
          created_at_date: { $dateFromString: { dateString: "$created_at" } }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at_date" } },
          totalSales: { $sum: { $toDouble: "$total_price" } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json(salesData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }

}
