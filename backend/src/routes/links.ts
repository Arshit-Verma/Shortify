import { Router, Request, Response } from "express";
import { getLinksByOwner, deleteLink } from "../services/shortener.js";
import { requireOwnerToken } from "../middleware/ownerToken.js";
import env from "../utils/config.js";

const router = Router();

/**
 * GET /api/links
 * List all short links for the current owner
 */
router.get("/links", requireOwnerToken, async (req: Request, res: Response) => {
  try {
    const ownerToken = (req as any).ownerToken;

    const links = await getLinksByOwner(ownerToken);

    // Enhance response with short_url for each link
    const enrichedLinks = links.map((link) => ({
      id: link.id,
      short_code: link.short_code,
      short_url: `${env.BASE_URL}/r/${link.short_code}`,
      target_url: link.target_url,
      click_count: link.click_count,
      created_at: link.created_at,
      last_click_at: link.last_click_at,
    }));

    return res.status(200).json(enrichedLinks);
  } catch (error) {
    console.error("Error in GET /api/links:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch links",
    });
  }
});

/**
 * DELETE /api/links/:id
 * Delete a short link (only owner can delete)
 */
router.delete(
  "/links/:id",
  requireOwnerToken,
  async (req: Request, res: Response) => {
    try {
      const ownerToken = (req as any).ownerToken;
      const { id } = req.params;

      // Delete the link (verifies ownership)
      await deleteLink(id, ownerToken);

      return res.status(200).json({
        message: "Link deleted successfully",
        id,
      });
    } catch (error: any) {
      console.error("Error in DELETE /api/links/:id:", error);

      // Check if it's a "not found" or "not authorized" error
      if (error.message.includes("not found")) {
        return res.status(404).json({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (error.message.includes("not authorized")) {
        return res.status(403).json({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this link",
        });
      }

      return res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Failed to delete link",
      });
    }
  },
);

export default router;
