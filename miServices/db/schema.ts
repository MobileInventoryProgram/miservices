// Database schema for miServices members area
// Reference: blueprint:javascript_auth_all_persistance

import { pgTable, serial, integer, varchar, timestamp, text, index, jsonb } from 'drizzle-orm/pg-core';

// Session storage table (required for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with custom roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 50 }).notNull().$type<'franchise' | 'admin' | 'superadmin'>(),
  companyName: varchar("company_name", { length: 255 }),
  postCodes: text("post_codes"),
  territory: text("territory"),
  townsCities: text("towns_cities"),
  contractLink: varchar("contract_link", { length: 500 }),
  jobDescription: text("job_description"),
  jobDescriptionLink: varchar("job_description_link", { length: 500 }),
  profilePicture: varchar("profile_picture", { length: 500 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: varchar("is_active", { length: 10 }).notNull().default('true'),
  slug: varchar("slug", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CRM Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  franchiseId: integer("franchise_id").references(() => users.id), // nullable - which franchise owns this contact
  ownerId: integer("owner_id").notNull().references(() => users.id), // who manages this contact
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  status: varchar("status", { length: 50 }).default('lead'), // lead, customer, etc.
  source: varchar("source", { length: 255 }), // where contact came from
  notesCount: integer("notes_count").default(0),
  lastContactedAt: timestamp("last_contacted_at"),
  lastEmailOpenedAt: timestamp("last_email_opened_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact notes table
export const contactNotes = pgTable("contact_notes", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  authorId: integer("author_id").notNull().references(() => users.id),
  noteText: text("note_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact emails table
export const contactEmails = pgTable("contact_emails", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  authorId: integer("author_id").notNull().references(() => users.id),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  openedAt: timestamp("opened_at"),
  opened: varchar("opened", { length: 10 }).default('false'),
});

// Proposals table (replaces simple quotes)
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  franchiseId: integer("franchise_id").references(() => users.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 500 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('draft'), // draft, sent, viewed, accepted, declined
  contentJson: jsonb("content_json").$type<any>().default({}), // structured blocks for proposal builder
  pdfUrl: varchar("pdf_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
  acceptedAt: timestamp("accepted_at"),
  acceptedBy: varchar("accepted_by", { length: 255 }), // name of person who accepted
});

// Proposal templates table
export const proposalTemplates = pgTable("proposal_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  contentJson: jsonb("content_json").$type<any>().default({}),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CSV Import history table
export const imports = pgTable("imports", {
  id: serial("id").primaryKey(),
  fileUrl: varchar("file_url", { length: 500 }),
  importedBy: integer("imported_by").notNull().references(() => users.id),
  totalContacts: integer("total_contacts").default(0),
  successful: integer("successful").default(0),
  failed: integer("failed").default(0),
  errors: jsonb("errors").$type<any>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Personal documents table (PDFs assigned to users)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileSize: integer("file_size"), // in bytes
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id), // admin who uploaded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Process docs table (links to Ghost CMS pages)
export const processDocs = pgTable("process_docs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  ghostSlug: varchar("ghost_slug", { length: 255 }).notNull(),
  audience: varchar("audience", { length: 50 }).notNull().$type<'franchise' | 'admin'>(),
  section: varchar("section", { length: 255 }).notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: varchar("is_active", { length: 10 }).notNull().default('true'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type ContactNote = typeof contactNotes.$inferSelect;
export type InsertContactNote = typeof contactNotes.$inferInsert;
export type ContactEmail = typeof contactEmails.$inferSelect;
export type InsertContactEmail = typeof contactEmails.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;
export type ProposalTemplate = typeof proposalTemplates.$inferSelect;
export type InsertProposalTemplate = typeof proposalTemplates.$inferInsert;
export type Import = typeof imports.$inferSelect;
export type InsertImport = typeof imports.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type ProcessDoc = typeof processDocs.$inferSelect;
export type InsertProcessDoc = typeof processDocs.$inferInsert;
