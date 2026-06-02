import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
export const {handlers,auth,signIn,signOut}=NextAuth({secret:process.env.AUTH_SECRET||(process.env.NODE_ENV==="development"?"tech-tatva-local-development-only":undefined),session:{strategy:"jwt"},providers:[Google,Credentials({credentials:{email:{},password:{}},authorize:async(c)=>{await connectDB();const user=await User.findOne({email:c.email}).select("+passwordHash").populate("role");if(!user?.passwordHash||!await bcrypt.compare(String(c.password),user.passwordHash))return null;return {id:String(user._id),name:user.name,email:user.email,role:user.role?.slug}}})],callbacks:{jwt:async({token,user})=>{if(user)token.role=(user as {role?:string}).role||"student_visitor";return token},session:async({session,token})=>{(session.user as typeof session.user&{role?:string}).role=String(token.role||"student_visitor");return session}}});
