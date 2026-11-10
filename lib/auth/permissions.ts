export const ROLES = ["super_admin", "admin", "supervisor", "staff"] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  supervisor: "Supervisor",
  staff: "Staff",
};

export interface RoleActor {
  id: string;
  role: UserRole;
}

export function isAdminTier(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}

export function canManageUsers(role: UserRole): boolean {
  return isAdminTier(role);
}

export function canAssignRole(actor: UserRole, target: UserRole): boolean {
  if (target === "super_admin") return false;
  if (target === "admin") return actor === "super_admin";
  if (target === "supervisor" || target === "staff") return isAdminTier(actor);
  return false;
}

export function assignableRoles(actor: UserRole): UserRole[] {
  return ROLES.filter((role) => canAssignRole(actor, role));
}

export function canEditUser(actor: RoleActor, target: RoleActor): boolean {
  if (target.role === "super_admin") {
    return actor.role === "super_admin" && actor.id === target.id;
  }
  if (target.role === "admin") {
    return actor.role === "super_admin";
  }
  return isAdminTier(actor.role);
}

export function canDeleteUser(actor: RoleActor, target: RoleActor): boolean {
  if (actor.id === target.id || target.role === "super_admin") return false;
  if (target.role === "admin") return actor.role === "super_admin";
  return isAdminTier(actor.role);
}

export function canDeactivateUser(actor: RoleActor, target: RoleActor): boolean {
  return canDeleteUser(actor, target);
}

export function canSetActive(actor: RoleActor, target: RoleActor, nextActive: boolean): boolean {
  if (nextActive) {
    if (target.role === "super_admin") return actor.id === target.id;
    return canEditUser(actor, target);
  }
  return canDeactivateUser(actor, target);
}

export function canChangeUserRole(
  actor: RoleActor,
  target: RoleActor,
  nextRole: UserRole
): boolean {
  if (nextRole === "super_admin" || target.role === "super_admin") return false;
  if (actor.id === target.id) return nextRole === target.role;
  if (!canEditUser(actor, target)) return false;
  return canAssignRole(actor.role, nextRole);
}

export function canViewAllLeads(role: UserRole): boolean {
  return role !== "staff";
}

export function canAssignLeads(role: UserRole): boolean {
  return role === "supervisor" || isAdminTier(role);
}

export function canExportLead(role: UserRole): boolean {
  return role === "supervisor" || isAdminTier(role);
}

export function canBulkExport(role: UserRole): boolean {
  return isAdminTier(role);
}

export function canDeleteLead(role: UserRole): boolean {
  return isAdminTier(role);
}

export function leadListFilter(
  role: UserRole,
  userId: string,
  requestedAssignee?: string
): { assignedTo?: string } {
  if (role === "staff") return { assignedTo: userId };
  if (requestedAssignee) return { assignedTo: requestedAssignee };
  return {};
}

export function canAccessLead(role: UserRole, userId: string, assignedTo: unknown): boolean {
  if (role !== "staff") return true;
  return assignedId(assignedTo) === userId;
}

function assignedId(assignedTo: unknown): string {
  if (!assignedTo) return "";
  if (typeof assignedTo === "object" && assignedTo !== null && "_id" in assignedTo) {
    return String((assignedTo as { _id: unknown })._id);
  }
  return String(assignedTo);
}
