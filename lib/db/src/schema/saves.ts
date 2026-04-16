import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const saveSlotsTable = pgTable("save_slots", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slot: integer("slot").notNull(),
  currentLevel: integer("current_level").notNull().default(1),
  data: jsonb("data"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSaveSlotSchema = createInsertSchema(saveSlotsTable).omit({ updatedAt: true });
export type InsertSaveSlot = z.infer<typeof insertSaveSlotSchema>;
export type SaveSlot = typeof saveSlotsTable.$inferSelect;
