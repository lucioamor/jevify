declare function generateObject(x: unknown): Promise<any>;
declare function banUser(id: string): Promise<void>;

// Policy: account bans require a moderator decision (see docs/policy.md).
export async function autoModerate(user: { id: string; reports: string[] }) {
  const r = await generateObject({ prompt: `Should this user be banned? ${user.reports.join("\n")}` });
  if (r.object.ban === true) await banUser(user.id);
}
