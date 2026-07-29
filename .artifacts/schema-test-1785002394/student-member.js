"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentMemberUpdateSchema = exports.studentMemberRegistrationSchema = exports.STUDENT_MEMBER_STATUSES = exports.GENDERS = exports.YEARS = exports.INTERESTS = exports.DEPARTMENTS = void 0;
const zod_1 = require("zod");
exports.DEPARTMENTS = [
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
];
exports.INTERESTS = [
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
];
exports.YEARS = ["1st", "2nd", "3rd", "4th", "5th"];
exports.GENDERS = ["male", "female", "other", "prefer_not_to_say"];
exports.STUDENT_MEMBER_STATUSES = ["pending", "approved", "rejected"];
exports.studentMemberRegistrationSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
    uid: zod_1.z.string().trim().min(3, "University ID must be at least 3 characters").max(40),
    department: zod_1.z.string().trim().min(1, "Please select your department"),
    year: zod_1.z.string().trim().min(1, "Please select your year"),
    section: zod_1.z.string().trim().max(40, "Section must be 40 characters or fewer").optional().default(""),
    email: zod_1.z.string().trim().email("Enter a valid email address").max(160),
    phone: zod_1.z.string().trim().min(7, "Phone number must be at least 7 digits").max(20, "Phone number is too long"),
    gender: zod_1.z.enum(exports.GENDERS, { errorMap: () => ({ message: "Please select your gender" }) }),
    interests: zod_1.z.array(zod_1.z.string().min(1)).min(1, "Please select at least one interest").max(8, "You can select up to 8 interests"),
    source: zod_1.z.enum(["online", "qr", "admin"]).optional().default("online")
});
exports.studentMemberUpdateSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2).max(120).optional(),
    uid: zod_1.z.string().trim().min(3).max(40).optional(),
    department: zod_1.z.string().trim().min(1).optional(),
    year: zod_1.z.string().trim().min(1).optional(),
    section: zod_1.z.string().trim().max(40, "Section must be 40 characters or fewer").optional(),
    email: zod_1.z.string().trim().email().max(160).optional(),
    phone: zod_1.z.string().trim().min(7).max(20).optional(),
    gender: zod_1.z.enum(exports.GENDERS).optional(),
    interests: zod_1.z.array(zod_1.z.string().min(1)).min(1).max(8).optional(),
    status: zod_1.z.enum(exports.STUDENT_MEMBER_STATUSES).optional(),
    adminRemarks: zod_1.z.string().max(2000).optional(),
    source: zod_1.z.enum(["online", "qr", "admin"]).optional()
});
