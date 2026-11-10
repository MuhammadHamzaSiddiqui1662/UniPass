import {
  assignableRoles,
  canAccessLead,
  canAssignRole,
  canBulkExport,
  canChangeUserRole,
  canDeleteUser,
  canEditUser,
  canExportLead,
  leadListFilter,
} from "../lib/auth/permissions";

const superAdmin = { id: "super", role: "super_admin" as const };
const admin = { id: "admin", role: "admin" as const };
const supervisor = { id: "supervisor", role: "supervisor" as const };
const staff = { id: "staff", role: "staff" as const };

describe("role assignment", () => {
  test("only a super admin can create an admin", () => {
    expect(canAssignRole("super_admin", "admin")).toBe(true);
    expect(canAssignRole("admin", "admin")).toBe(false);
    expect(canAssignRole("supervisor", "staff")).toBe(false);
  });

  test("admins can create supervisors and staff", () => {
    expect(assignableRoles("admin")).toEqual(["supervisor", "staff"]);
    expect(assignableRoles("super_admin")).toEqual(["admin", "supervisor", "staff"]);
  });

  test("nobody can create a second super admin", () => {
    for (const actor of ["super_admin", "admin", "supervisor", "staff"] as const) {
      expect(canAssignRole(actor, "super_admin")).toBe(false);
    }
    expect(canChangeUserRole(superAdmin, admin, "super_admin")).toBe(false);
  });
});

describe("user management", () => {
  test("a super admin cannot delete or demote their own account", () => {
    expect(canDeleteUser(superAdmin, superAdmin)).toBe(false);
    expect(canChangeUserRole(superAdmin, superAdmin, "admin")).toBe(false);
    expect(canEditUser(superAdmin, superAdmin)).toBe(true);
  });

  test("an admin cannot edit or delete an admin or the super admin", () => {
    expect(canEditUser(admin, superAdmin)).toBe(false);
    expect(canEditUser(admin, { id: "other-admin", role: "admin" })).toBe(false);
    expect(canDeleteUser(admin, { id: "other-admin", role: "admin" })).toBe(false);
    expect(canEditUser(admin, staff)).toBe(true);
    expect(canChangeUserRole(admin, staff, "supervisor")).toBe(true);
    expect(canChangeUserRole(admin, staff, "admin")).toBe(false);
  });

  test("a super admin can manage admin users", () => {
    expect(canEditUser(superAdmin, admin)).toBe(true);
    expect(canDeleteUser(superAdmin, admin)).toBe(true);
    expect(canChangeUserRole(superAdmin, admin, "supervisor")).toBe(true);
  });
});

describe("lead scope", () => {
  test("staff only see leads assigned to themselves", () => {
    expect(leadListFilter("staff", "staff-1", "someone-else")).toEqual({ assignedTo: "staff-1" });
    expect(canAccessLead("staff", "staff-1", "staff-1")).toBe(true);
    expect(canAccessLead("staff", "staff-1", "staff-2")).toBe(false);
    expect(canAccessLead("staff", "staff-1", null)).toBe(false);
    expect(canAccessLead("staff", "staff-1", { _id: "staff-1" })).toBe(true);
  });

  test("supervisors see every lead and can export one, not a bulk file", () => {
    expect(leadListFilter("supervisor", "supervisor-1")).toEqual({});
    expect(canAccessLead("supervisor", "supervisor-1", "staff-1")).toBe(true);
    expect(canExportLead("supervisor")).toBe(true);
    expect(canBulkExport("supervisor")).toBe(false);
    expect(canExportLead("staff")).toBe(false);
    expect(canBulkExport("admin")).toBe(true);
  });

  test("staff and supervisors cannot manage each other", () => {
    expect(canEditUser(supervisor, staff)).toBe(false);
    expect(canDeleteUser(staff, supervisor)).toBe(false);
  });
});
