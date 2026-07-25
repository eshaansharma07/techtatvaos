import { z } from "zod";

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Computer Science & Information Technology",
  "Information Technology",
  "Electrical Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Business Administration",
  "Commerce",
  "Arts",
  "Science",
  "Law",
  "Pharmacy",
  "Architecture",
  "Hotel Management",
  "Media & Mass Communication",
  "Other"
] as const;

export const INTERESTS = [
  "Web Development",
  "App Development",
  "AI / Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "IoT",
  "Game Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Video Editing",
  "Marketing",
  "Event Management",
  "Open Source",
  "Competitive Programming"
] as const;

export const YEARS = ["1st", "2nd", "3rd", "4th", "5th"] as const;
export const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
export const STUDENT_MEMBER_STATUSES = ["pending", "approved", "rejected"] as const;

export const studentMemberRegistrationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  uid: z.string().trim().min(3, "University ID must be at least 3 characters").max(40),
  department: z.string().trim().min(1, "Please select your department"),
  year: z.string().trim().min(1, "Please select your year"),
  section: z.string().trim().max(40, "Section must be 40 characters or fewer").optional().default(""),
  email: z.string().trim().email("Enter a valid email address").max(160),
  phone: z.string().trim().min(7, "Phone number must be at least 7 digits").max(20, "Phone number is too long"),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Please select your gender" }) }),
  interests: z.array(z.string().min(1)).min(1, "Please select at least one interest").max(8, "You can select up to 8 interests"),
  source: z.enum(["online", "qr", "admin"]).optional().default("online")
});

export const studentMemberUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  uid: z.string().trim().min(3).max(40).optional(),
  department: z.string().trim().min(1).optional(),
  year: z.string().trim().min(1).optional(),
  section: z.string().trim().max(40, "Section must be 40 characters or fewer").optional(),
  email: z.string().trim().email().max(160).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
  gender: z.enum(GENDERS).optional(),
  interests: z.array(z.string().min(1)).min(1).max(8).optional(),
  status: z.enum(STUDENT_MEMBER_STATUSES).optional(),
  adminRemarks: z.string().max(2000).optional(),
  source: z.enum(["online", "qr", "admin"]).optional()
});

export type StudentMemberRegistration = z.infer<typeof studentMemberRegistrationSchema>;
export type StudentMemberUpdate = z.infer<typeof studentMemberUpdateSchema>;
