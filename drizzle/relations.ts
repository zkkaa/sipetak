import { relations } from "drizzle-orm/relations";
import { users, deletionRequests, umkmLocations, reports, masterLocations, submissions, notifications } from "./schema";

export const deletionRequestsRelations = relations(deletionRequests, ({one}) => ({
	user_reviewedBy: one(users, {
		fields: [deletionRequests.reviewedBy],
		references: [users.id],
		relationName: "deletionRequests_reviewedBy_users_id"
	}),
	umkmLocation: one(umkmLocations, {
		fields: [deletionRequests.umkmLocationId],
		references: [umkmLocations.id]
	}),
	user_userId: one(users, {
		fields: [deletionRequests.userId],
		references: [users.id],
		relationName: "deletionRequests_userId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	deletionRequests_reviewedBy: many(deletionRequests, {
		relationName: "deletionRequests_reviewedBy_users_id"
	}),
	deletionRequests_userId: many(deletionRequests, {
		relationName: "deletionRequests_userId_users_id"
	}),
	reports: many(reports),
	umkmLocations: many(umkmLocations),
	notifications: many(notifications),
}));

export const umkmLocationsRelations = relations(umkmLocations, ({one, many}) => ({
	deletionRequests: many(deletionRequests),
	masterLocation: one(masterLocations, {
		fields: [umkmLocations.masterLocationId],
		references: [masterLocations.id]
	}),
	user: one(users, {
		fields: [umkmLocations.userId],
		references: [users.id]
	}),
	submissions: many(submissions),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	user: one(users, {
		fields: [reports.adminHandlerId],
		references: [users.id]
	}),
}));

export const masterLocationsRelations = relations(masterLocations, ({many}) => ({
	umkmLocations: many(umkmLocations),
}));

export const submissionsRelations = relations(submissions, ({one}) => ({
	umkmLocation: one(umkmLocations, {
		fields: [submissions.umkmLocationId],
		references: [umkmLocations.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));