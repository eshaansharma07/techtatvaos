import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Event, Certificate, EventRegistration, ClubInfo, Attendance } from "@/lib/models";
import { requirePortal, audit } from "@/lib/portal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const objectId = (value: any) => String(value?._id || value?.id || value || "");

// Helper to generate unique certificate numbers: TT-{year}-{sequence}
async function generateNextCertNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TT-${year}-`;
  
  // Find the highest sequence number in the current year
  const lastCert = (await Certificate.findOne({
    certNumber: new RegExp(`^TT-${year}-\\d{4}$`)
  })
  .sort({ certNumber: -1 })
  .lean()) as any;

  let nextSequence = 1;
  if (lastCert && lastCert.certNumber) {
    const parts = lastCert.certNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }
  
  // Return the next padded certificate number
  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    if (!(await auth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = req.nextUrl.searchParams.get("event");
    if (!eventId) {
      return NextResponse.json({ error: "event ID is required" }, { status: 400 });
    }
    if (!Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    await connectDB();
    const eventObjectId = new Types.ObjectId(eventId);

    const [event, savedCerts, registrations, attendanceRows] = await Promise.all([
      Event.findById(eventObjectId).lean(),
      Certificate.find({ event: eventObjectId }).sort({ createdAt: 1 }).lean(),
      EventRegistration.find({ event: eventObjectId, status: "confirmed" })
        .populate("user", "uid name email program semester")
        .lean(),
      Attendance.find({ event: eventObjectId, status: "present" }).select("user").lean()
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const presentUserIds = new Set(attendanceRows.map((r: any) => objectId(r.user)));

    // Gather all unique registered users (including team members)
    const registeredCandidates: any[] = [];
    const registeredUserIds = new Set<string>();

    for (const reg of registrations as any[]) {
      const candidates = [
        reg.user ? { userObj: reg.user, mode: reg.mode || "individual", teamName: reg.teamName || "" } : null,
        ...(reg.teamMembers || []).map((m: any) => ({
          userObj: m,
          mode: "team",
          teamName: reg.teamName || ""
        }))
      ].filter(Boolean);

      for (const cand of candidates) {
        const u = cand.userObj;
        const userId = objectId(u.user || u);
        if (!userId || registeredUserIds.has(userId)) continue;
        registeredUserIds.add(userId);
        registeredCandidates.push({
          user: userId,
          name: u.name || "",
          uid: u.uid || "",
          email: u.email || "",
          program: u.program || "",
          semester: u.semester || null,
          mode: cand.mode,
          teamName: cand.teamName,
          isPresent: presentUserIds.has(userId)
        });
      }
    }

    // Merge saved certificates with registrations
    const finalCandidates: any[] = [];
    const savedMappedUserIds = new Set<string>();

    for (const cert of savedCerts as any[]) {
      const certUserId = cert.user ? objectId(cert.user) : null;
      if (certUserId) {
        savedMappedUserIds.add(certUserId);
      }
      
      const matchingReg = registeredCandidates.find(rc => rc.user === certUserId);

      finalCandidates.push({
        id: objectId(cert),
        user: certUserId,
        recipientName: cert.recipientName,
        uid: cert.uid || matchingReg?.uid || "",
        email: cert.email || matchingReg?.email || "",
        program: cert.program || matchingReg?.program || "",
        semester: cert.semester || matchingReg?.semester || null,
        rank: cert.rank || "Participation",
        certNumber: cert.certNumber || "",
        isGenerated: !!cert.certNumber,
        mode: matchingReg?.mode || "individual",
        teamName: matchingReg?.teamName || "",
        isPresent: certUserId ? presentUserIds.has(certUserId) : false
      });
    }

    // Add candidates that are registered but don't have a saved certificate record yet
    for (const rc of registeredCandidates) {
      if (savedMappedUserIds.has(rc.user)) continue;
      finalCandidates.push({
        id: "",
        user: rc.user,
        recipientName: rc.name,
        uid: rc.uid,
        email: rc.email,
        program: rc.program,
        semester: rc.semester,
        rank: "Participation",
        certNumber: "",
        isGenerated: false,
        mode: rc.mode,
        teamName: rc.teamName,
        isPresent: rc.isPresent
      });
    }

    // Load default branding fallback values if settings are not set on Event
    const clubInfoRows = await ClubInfo.find({ key: { $in: ["clubName", "hodName", "facultyAdvisorName", "coFacultyAdvisorName"] } }).lean();
    const branding = Object.fromEntries(clubInfoRows.map((row: any) => [row.key, row.value]));

    const settings = {
      certEventName: (event as any).certEventName || (event as any).title || "",
      certEventDate: (event as any).certEventDate || new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date((event as any).startAt || Date.now())).replace(/^0/, "") || "",
      certHod: (event as any).certHod || branding.hodName || "",
      certFacultyAdvisor: (event as any).certFacultyAdvisor || branding.facultyAdvisorName || "",
      certCoFacultyAdvisor: (event as any).certCoFacultyAdvisor || branding.coFacultyAdvisorName || ""
    };

    return NextResponse.json({
      settings,
      candidates: finalCandidates
    });
  } catch (error) {
    console.error("Failed to fetch certificate settings and candidates", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const blocked = await requirePortal(req);
    if (blocked) return blocked;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { event: eventId, settings, candidates } = body;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    await connectDB();
    const eventObjectId = new Types.ObjectId(eventId);

    // 1. Update event settings
    if (settings) {
      await Event.findByIdAndUpdate(eventObjectId, {
        $set: {
          certEventName: settings.certEventName,
          certEventDate: settings.certEventDate,
          certHod: settings.certHod,
          certFacultyAdvisor: settings.certFacultyAdvisor,
          certCoFacultyAdvisor: settings.certCoFacultyAdvisor
        }
      });
    }

    // 2. Save/Update candidates in Certificates collection
    const savedCertificates: any[] = [];
    if (Array.isArray(candidates)) {
      for (const cand of candidates) {
        let certDoc: any = null;

        if (cand.id && Types.ObjectId.isValid(cand.id)) {
          // Update existing Certificate
          certDoc = await Certificate.findById(cand.id);
        }

        if (!certDoc && cand.user && Types.ObjectId.isValid(cand.user)) {
          // Fallback check: see if a certificate was already created for this user/event in another parallel request
          certDoc = await Certificate.findOne({ event: eventObjectId, user: new Types.ObjectId(cand.user) });
        }

        let certNumber = cand.certNumber || (certDoc ? certDoc.certNumber : "");
        // If they need to be generated and don't have a number, we will allocate one during POST save to lock it in
        if (cand.generateCertNum && !certNumber) {
          certNumber = await generateNextCertNumber();
        }

        const updateData = {
          event: eventObjectId,
          user: cand.user ? new Types.ObjectId(cand.user) : undefined,
          recipientName: cand.recipientName || "Recipient Name",
          uid: cand.uid || "",
          email: cand.email || "",
          program: cand.program || "",
          semester: cand.semester || null,
          rank: cand.rank || "Participation",
          certNumber: certNumber || undefined,
          issuedAt: certNumber ? new Date() : undefined
        };

        if (certDoc) {
          // Update
          const updated = await Certificate.findByIdAndUpdate(certDoc._id, { $set: updateData }, { new: true }).lean();
          savedCertificates.push(updated);
        } else {
          // Create new
          const created = await Certificate.create(updateData);
          savedCertificates.push(created.toObject());
        }
      }
    }

    await audit(req, "portal.certificates.save", { entityType: "event", entityId: eventId, count: savedCertificates.length });

    return NextResponse.json({
      success: true,
      certificates: savedCertificates
    });
  } catch (error) {
    console.error("Failed to save certificate configurations", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
