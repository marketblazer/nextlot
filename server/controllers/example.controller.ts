import { Request, Response } from 'express';

// Stubs; wire to actual models once provided
export async function list(req: Request, res: Response) {
  res.json({ data: [], message: 'List examples stub' });
}

export async function create(req: Request, res: Response) {
  const body = req.body ?? {};
  res.status(201).json({ data: body, message: 'Create example stub' });
}