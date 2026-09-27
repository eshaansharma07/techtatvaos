import { z } from "zod";

export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  mode: z.enum(["individual", "team"]),
  teamName: z.string().optional(),
  members: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number is too short"),
    uid: z.string().min(1, "UID is required"),
    program: z.string().min(1, "Program is required"),
    semester: z.string().optional()
  })).optional()
});

export const membershipDriveSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone"),
  uid: z.string().min(1, "UID is required"),
  department: z.string().min(1, "Department is required"),
  year: z.string().min(1, "Year is required"),
  section: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  interests: z.array(z.string()).min(1, "Select at least one interest")
});

export const reapprovalSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  action: z.enum(["require", "disable", "promote", "manual_reapprove"]),
  scope: z.enum(["all", "waitlisted"]).optional(),
  registrationId: z.string().optional()
});

export const adminCrudSchema = z.object({
  resource: z.string().min(1, "Resource name is required"),
  id: z.string().optional(),
  payload: z.record(z.any())
});

export const checkStatusSchema = z.object({
  email: z.string().email("Invalid email"),
  uid: z.string().min(1, "UID is required"),
  action: z.enum(["check", "confirm"]).optional()
});

