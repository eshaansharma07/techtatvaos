# DEPLOYMENT TARGET (IMPORTANT)

This is not a prototype, mockup, redesign concept, or separate demo project.

All of the changes described in this specification must be implemented directly into the existing production website:

https://techtatva.in

Do not create a new project, clone, staging website, or alternate version unless explicitly required for development.

The objective is to upgrade the existing Tech Tatva website, preserving all current functionality while replacing and enhancing the UI/UX and adding the new Membership Drive system.

Specifically:

* Integrate all new features into the existing codebase.
* Preserve all existing routes, APIs, authentication, admin functionality, and backend architecture unless modifications are required to support the new features.
* Maintain backward compatibility with the current database wherever possible.
* Migrate existing components to the new design system rather than creating duplicate pages.
* Ensure that all existing content (Events, Teams, Hall of Fame, Gallery, Calendar, Recruitment, About, Admin Portal, etc.) continues to function correctly after the redesign.
* Do not remove existing features unless they are being replaced with an improved version.
* The final result should be production-ready and fully deployable to https://techtatva.in.

The end goal is that visitors to techtatva.in experience the redesigned interface and new Membership Drive functionality directly on the live website, without changing the club's identity or disrupting existing functionality.

---

# MEMBERSHIP DRIVE INTEGRATION (PUBLIC WEBSITE + ADMIN PORTAL)

The Membership Drive feature must be fully integrated into both the public-facing website and the Admin Portal. It should not exist as a standalone page or disconnected module.

## Public Website Integration

Integrate the Membership Drive seamlessly into https://techtatva.in.

### Navigation

Add a new navigation item:

**Membership Drive** (or **Join Us**)

Position it appropriately within the existing navigation (for example, between Recruitment and Events, or next to Connect).

### Homepage

Prominently promote the Membership Drive with:

* A dedicated hero CTA ("Join Tech Tatva")
* A featured Membership Drive section explaining the benefits of joining
* A "Join Community" button linking to the registration page
* Optional countdown or announcement banner when registrations are open

### Recruitment Page

Redesign the Recruitment page to guide students toward joining the community.

Suggested flow:

```
Discover Tech Tatva → Explore Teams → Learn About Opportunities → Join Community → Registration Successful
```

### Membership Registration

Create a premium public registration page at:

`/join`

The page must match the new Tech Tatva OS design language and include:

* Hero section
* Benefits of joining
* Registration form
* Success state
* Duplicate registration validation
* QR code compatibility for offline membership drives

The registration process should feel like onboarding into a modern software platform rather than filling out a simple form.

---

## Admin Portal Integration

Create a completely new Membership Drive module inside the existing Admin Portal.

This module must be fully integrated into the current admin dashboard and should not interfere with existing Core Member management.

### Sidebar

Add a new menu item:

**Membership Drive**

### Dashboard

Provide administrators with:

* Total Student Members
* Today's Registrations
* Pending Approvals
* Approved Members
* Recent Registrations
* Department-wise Statistics
* Year-wise Statistics
* Interest-wise Statistics
* Daily & Monthly Registration Trends

### Member Management

Admins should be able to:

* View all Student Members
* Search by name, UID, email, or phone
* Filter by department, year, status, interests, and registration date
* View complete member details
* Approve or reject registrations
* Edit registration details if required
* Delete registrations
* Add internal remarks or notes
* Export all or filtered data to Excel

### Export

Provide one-click export to:

`StudentMembers.xlsx`

Include: Full Name, University UID, Department, Year, Section, Email, Phone, Gender, Interests, Registration Date, Status

Support exporting filtered datasets as well.

---

## Separation of Member Types

At no point should Core Members and Student Members be treated as the same entity.

Throughout the entire application:

* Separate database tables/collections
* Separate APIs
* Separate statistics
* Separate dashboards
* Separate search results
* Separate analytics
* Separate counts
* Separate management interfaces

**Core Members** are responsible for operating the club.

**Student Members** are community members participating in club activities.

This separation must remain consistent across the public website, admin portal, backend, APIs, analytics, and future feature development.
