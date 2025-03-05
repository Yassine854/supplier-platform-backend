import express, { Request, Response, NextFunction } from 'express';
import Manufacturer from '../model/supplier';

const router = express.Router();

// Helper to sanitize regex input
const escapeRegex = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Unified Login Route with case-insensitive company name
router.post('/login', async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Super Admin check (case-sensitive)
    if (username === 'admin' && password === 'admin') {
      return res.json({ 
        success: true, 
        role: 'superadmin',
        user: { username: 'admin' }
      });
    }

    // Case-insensitive company name search with exact match
    const supplier = await Manufacturer.findOne({
      company_name: { 
        $regex: new RegExp(`^${escapeRegex(username)}$`, 'i') 
      },
      phone_number: password
    });

    if (supplier) {
      return res.json({
        success: true,
        role: 'supplier',
        user: {
          manufacturer_id: supplier.manufacturer_id,
          company_name: supplier.company_name,
          email: supplier.email,
          contact_name: supplier.contact_name,
          phone_number: supplier.phone_number,
          city: supplier.city,
          postal_code: supplier.postal_code
        }
      });
    }

    res.status(401).json({
      success: false,
      message: "Informations d'identification non valides"
    });

  } catch (error) {
    next(error);
  }
});

export default router;