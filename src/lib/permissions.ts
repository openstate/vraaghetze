import { createAccessControl, type Role } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
	...defaultStatements,
	question: ['ask', 'answer', 'moderate']
} as const;

export const ac = createAccessControl(statement);

export const defaultRole = 'user';

export const roles = {
	[defaultRole]: ac.newRole({ question: ['ask'] }),
	politician: ac.newRole({ question: ['answer'] }),
	moderator: ac.newRole({ question: ['moderate'] }),
	admin: ac.newRole({ ...adminAc.statements, question: ['moderate'] })
};

export type Permission = {
	[Resource in keyof typeof statement]?: (typeof statement)[Resource][number][];
};

export function hasPermission(
	user: { role?: string | null } | null | undefined,
	permission: Permission
) {
	const rolesByName: Record<string, Role | undefined> = roles;
	const assignedRoles = (user?.role || defaultRole).split(',');
	return assignedRoles.some((roleName) => rolesByName[roleName]?.authorize(permission).success);
}
