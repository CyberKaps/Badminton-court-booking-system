import type { Request, Response } from 'express';
import { prisma } from "@repo/db/client"; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  role: z.enum(['USER', 'COACH']).optional() 
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    
    console.log("data:", data);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ 
        error: "Email already taken" 
    });

 
    const hashedPassword = await bcrypt.hash(data.password, 10);

    console.log("hashedPassword:", hashedPassword);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'USER'
      }
    });

    console.log("user created:", user);
   
    const token = jwt.sign({ 
        id: user.id, role: user.role 
    }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ 
        token, 
        user: { 
            id: user.id, 
            name: user.name, 
            role: user.role 
        } 
    });
  } catch (error: any) {
    res.status(400).json({ 
        error: error.message ,
        message: "Registration failed"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ 
        where: { 
            email
        } 
    });
    if (!user) return res.status(400).json({ 
        error: "Invalid credentials" 
    });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ 
        error: "Invalid credentials" 
    });

    const token = jwt.sign({ 
        id: user.id, 
        role: user.role 
    }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ 
        token, 
        user: { 
            id: user.id, 
            name: user.name, 
            role: user.role 
        } 
    });
  } catch (error: any) {
    res.status(400).json({ 
        error: error.message 
    });
  }
};