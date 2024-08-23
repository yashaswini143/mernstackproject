import { collections } from '../index.js';
import { db } from '../index.js';
import { cityCoordinates } from '../db/db.js';

export const geographicalDistribution = async(req,res)=>{
  try {
    const customers = db.collection(collections[1].name);
    const data = await customers.aggregate([
      { $match: { 'default_address.city': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$default_address.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
        const enrichedData = data.map(cityData => ({
      city: cityData._id,
      count: cityData.count,
      coordinates: cityCoordinates[cityData._id] || { lat: 0, lng: 0 } // Default to 0,0 if city not found
    }));

    res.json(enrichedData);

  } catch (error) {
    console.error('Error fetching geographical distribution data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } 

}
