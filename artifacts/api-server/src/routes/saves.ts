import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, saveSlotsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

router.get("/saves", requireAuth, async (req: any, res: any) => {
  try {
    const saves = await db
      .select()
      .from(saveSlotsTable)
      .where(eq(saveSlotsTable.userId, req.userId));
    res.json(saves);
  } catch (err) {
    res.status(500).json({ error: "Failed to load saves" });
  }
});

router.post("/saves/:slot", requireAuth, async (req: any, res: any) => {
  const slot = parseInt(req.params.slot, 10);
  if (slot < 1 || slot > 5) return res.status(400).json({ error: "Invalid slot" });

  const { currentLevel, data } = req.body;
  const id = `${req.userId}_${slot}`;

  try {
    const existing = await db
      .select()
      .from(saveSlotsTable)
      .where(and(eq(saveSlotsTable.userId, req.userId), eq(saveSlotsTable.slot, slot)));

    if (existing.length > 0) {
      await db
        .update(saveSlotsTable)
        .set({ currentLevel: currentLevel ?? 1, data, updatedAt: new Date() })
        .where(and(eq(saveSlotsTable.userId, req.userId), eq(saveSlotsTable.slot, slot)));
    } else {
      await db.insert(saveSlotsTable).values({ id, userId: req.userId, slot, currentLevel: currentLevel ?? 1, data });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save" });
  }
});

router.delete("/saves/:slot", requireAuth, async (req: any, res: any) => {
  const slot = parseInt(req.params.slot, 10);
  if (slot < 1 || slot > 5) return res.status(400).json({ error: "Invalid slot" });

  try {
    await db
      .delete(saveSlotsTable)
      .where(and(eq(saveSlotsTable.userId, req.userId), eq(saveSlotsTable.slot, slot)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete save" });
  }
});

export default router;
