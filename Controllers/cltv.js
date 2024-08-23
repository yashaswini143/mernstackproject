import { collections } from '../index.js';
import { db } from '../index.js';

export const customerLifeTime = async(req,res)=>{
    try {
        const customersCollection = db.collection(collections[1].name);

        const pipeline = [
            {
                $lookup: {
                    from: 'shopifyOrders',
                    localField: 'id',
                    foreignField: 'customer.id',
                    as: 'orders'
                }
            },
            {
                $unwind: {
                    path: '$orders',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: {
                        cohort: { $dateToString: { format: "%Y-%m", date: { $toDate: "$created_at" } } },
                        customerId: '$id'
                    },
                    firstOrderDate: { $min: { $toDate: "$orders.created_at" } },
                    lifetimeValue: { $sum: { $toDouble: "$orders.total_price" } }
                }
            },
            {
                $group: {
                    _id: '$_id.cohort',
                    averageLifetimeValue: { $avg: "$lifetimeValue" },
                    customers: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];

        const result = await customersCollection.aggregate(pipeline).toArray();

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching customer lifetime value by cohorts');
    }

}
