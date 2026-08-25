/* ==================================================================
   SERVER ONLY — imports Mongoose models.

   Never import this from a file carrying "use client". Client
   components take their constants from lib/xpChallenge.js instead.
================================================================== */

import connectDB from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import { XP_PROJECT_SLUG } from "@/lib/xpChallenge";

/**
 * Resolves what the signed-in person may do inside the XP challenge.
 *
 * The role is read from the DATABASE, never from session.role — the session
 * role is baked into the JWT at login, so a freshly promoted manager would
 * otherwise keep their old permissions until they logged out and back in.
 *
 * Returns null when there is no session, no user, or no project.
 */
export async function getXpContext(session, { slug = XP_PROJECT_SLUG, projectId } = {}) {
  if (!session?.uid) return null;
  await connectDB();

  const [user, project] = await Promise.all([
    User.findById(session.uid).select("fullName role xpPoints profile.neighborhood profile.avatar").lean(),
    projectId ? Project.findById(projectId).lean() : Project.findOne({ slug }).lean(),
  ]);
  if (!user || !project) return null;

  const uid = user._id.toString();
  const isSiteAdmin = user.role === "admin";
  const isOwner = project.owner?.toString() === uid;
  const isProjectAdmin = (project.admins || []).some((a) => a.toString() === uid);
  const isVolunteer = (project.volunteers || []).some((v) => v.toString() === uid);
  const neighborhood = user.profile?.neighborhood || null;

  // Site admins and the project owner work across every district.
  // A project manager is scoped to the neighborhood on their own profile.
  const unscoped = isSiteAdmin || isOwner;
  const canManage = unscoped || isProjectAdmin;

  return {
    user,
    project,
    uid,
    neighborhood,
    isSiteAdmin,
    isOwner,
    isProjectAdmin,
    isVolunteer,
    canManage,
    unscoped,
    /** null means "every neighborhood"; a string limits reads and writes to it */
    scope: unscoped ? null : neighborhood,
    /** a scoped manager with no neighborhood on their profile can do nothing */
    blockedForMissingNeighborhood: canManage && !unscoped && !neighborhood,
  };
}
