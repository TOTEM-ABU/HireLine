import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({
  id: "hireline",
  eventKey: ENV.INNGEST_EVENT_KEY,
  signingKey: ENV.INNGEST_SIGNIN_KEY,
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("🔥 SYNC EVENT KELDI:", event.name);
    console.log("User data:", event.data);

    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address || "no-email",
      name: `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User",
      profileImage: image_url || null,
    };

    const createdUser = await User.create(newUser);
    console.log("✅ MongoDB user created:", createdUser.clerkId);

    await upsertStreamUser({
      id: newUser.clerkId,
      name: newUser.name,
      image: newUser.profileImage,
    });
    console.log("✅ Stream user upserted:", newUser.clerkId);

    return { status: "synced", userId: newUser.clerkId };
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    console.log("🔥 DELETE EVENT KELDI:", event.name);
    console.log("Delete user ID:", event.data.id);

    await connectDB();
    const { id } = event.data;

    const deleted = await User.deleteOne({ clerkId: id });
    console.log(
      "✅ MongoDB user deleted:",
      deleted.deletedCount > 0 ? "Yes" : "No"
    );

    await deleteStreamUser(id);
    console.log("✅ Stream user deleted:", id);

    return { status: "deleted", userId: id };
  }
);

export const functions = [syncUser, deleteUserFromDB];
