import { collections } from '../index.js';
import { db } from '../index.js';

export const newCustomers = async(req,res)=>{
  try {
    const customers = db.collection(collections[1].name);

    const pipeline = [
        {
            $group: {
                _id: {
                    year: { $year: { $toDate: "$created_at" } },
                    month: { $month: { $toDate: "$created_at" } },
                },
                newCustomers: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                newCustomers: 1
            }
        }
    ];

    const newCustomersOverTime = await customers.aggregate(pipeline).toArray();

    res.json(newCustomersOverTime);
} catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
}

}
