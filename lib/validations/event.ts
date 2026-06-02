import { z } from "zod";
export const eventInput=z.object({title:z.string().min(3).max(120),slug:z.string().regex(/^[a-z0-9-]+$/),description:z.string().min(10).max(5000),venue:z.string().min(2),capacity:z.number().int().positive().max(10000),category:z.string().min(2),startAt:z.coerce.date(),endAt:z.coerce.date(),registrationOpen:z.boolean().default(false),team:z.string().optional()});
export const registrationInput=z.object({userId:z.string().length(24)});
