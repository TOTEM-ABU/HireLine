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

const transformClerkEvent = (rawEvent) => {
  const eventType = rawEvent.type;
  return {
    name: `clerk/${eventType}`,
    data: rawEvent.data,
    user: rawEvent.data,
    ts: Date.now(),
  };
};

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("🔥 SYNC EVENT TRIGGER BO'LD! Name:", event.name);
    console.log("Event data:", JSON.stringify(event.data, null, 2));

    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    if (!id) {
      console.error("❌ No user ID in event");
      return { error: "Missing user ID" };
    }

    const newUser = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address || null,
      name: `${first_name || ""} ${last_name || ""}`.trim() || "Anonymous",
      profileImage: image_url || null,
    };

    try {
      const created = await User.create(newUser);
      console.log("✅ MongoDB: User created:", created.clerkId);

      await upsertStreamUser({
        id: newUser.clerkId,
        name: newUser.name,
        image: newUser.profileImage,
      });
      console.log("✅ Stream: User created:", newUser.clerkId);

      return { success: true, userId: id };
    } catch (error) {
      console.error("❌ Sync error:", error);
      throw error;
    }
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    console.log("🔥 DELETE EVENT TRIGGER BO'LD! Name:", event.name);
    console.log("Delete data:", event.data.id);

    await connectDB();
    const { id } = event.data;

    if (!id) {
      console.error("❌ No user ID for delete");
      return { error: "Missing user ID" };
    }

    try {
      const deleted = await User.deleteOne({ clerkId: id });
      console.log("✅ MongoDB: Deleted count:", deleted.deletedCount);

      await deleteStreamUser(id);
      console.log("✅ Stream: User deleted:", id);

      return { success: true, userId: id };
    } catch (error) {
      console.error("❌ Delete error:", error);
      throw error;
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];
