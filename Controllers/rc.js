import { collections } from '../index.js';
import { db } from '../index.js';

export const repeatedCustomers = async(req,res)=>{
  try {
    const orders = db.collection(collections[0].name); // Ensure this matches your actual collection name

    const timeFrames = {
      daily: {
        $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$created_at' } }
      },
      monthly: {
        $dateToString: { format: '%Y-%m', date: { $toDate: '$created_at' } }
      },
      quarterly: {
        $concat: [
          { $substr: [{ $year: { $toDate: '$created_at' } }, 0, 4] },
          '-Q',
          { $toString: { $ceil: { $divide: [{ $month: { $toDate: '$created_at' } }, 3] } } }
        ]
      },
      yearly: {
        $dateToString: { format: '%Y', date: { $toDate: '$created_at' } }
      }
    };

    const results = {};

    for (const [timeFrame, group] of Object.entries(timeFrames)) {
      const pipeline = [
        {
          $project: {
            customer_id: '$customer.id', // Extract customer id from nested object
            period: group,
          },
        },
        {
          $group: {
            _id: {
              customer_id: '$customer_id',
              period: '$period',
            },
            purchaseCount: { $sum: 1 },
          },
        },
        {
          $match: {
            purchaseCount: { $gt: 1 }, // Filter customers with more than one purchase
          },
        },
        {
          $group: {
            _id: '$_id.period',
            repeatCustomers: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 }, // Sort results by period
        },
      ];

      const result = await orders.aggregate(pipeline).toArray();
      results[timeFrame] = result;

    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching repeat customers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}
