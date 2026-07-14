import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import pdf from "pdf-parse";

const f = createUploadthing();

export const ourFileRouter = {
  pdf: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async () => {
      console.log("[UploadThing Middleware] Auth checking...");
      const { userId } = await auth();
      console.log("[UploadThing Middleware] Retrieved Clerk userId:", userId);
      
      if (!userId) {
        console.error("[UploadThing Middleware] Error: Unauthorized (no clerk userId found)");
        throw new Error("Unauthorized");
      }

      console.log("[UploadThing Middleware] Querying database for user:", userId);
      let mongoUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });

      if (!mongoUser) {
        console.log("[UploadThing Middleware] User not found in DB. Creating a new user record...");
        const clerkUser = await currentUser();
        mongoUser = await prisma.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@local.invalid`,
            name: clerkUser ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null : null,
            imageUrl: clerkUser?.imageUrl ?? null,
          },
          select: { id: true },
        });
        console.log("[UploadThing Middleware] New database user created with ID:", mongoUser.id);
      } else {
        console.log("[UploadThing Middleware] Found existing database user ID:", mongoUser.id);
      }

      console.log("[UploadThing Middleware] Success. Passing metadata: mongoUserId =", mongoUser.id);
      return { mongoUserId: mongoUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing onUploadComplete] Triggered for file:", file.name);
      console.log("[UploadThing onUploadComplete] File Key:", file.key);
      console.log("[UploadThing onUploadComplete] File URL:", file.url);
      console.log("[UploadThing onUploadComplete] Metadata mongoUserId:", metadata.mongoUserId);

      let textContent = "";
      try {
        console.log("[UploadThing onUploadComplete] Fetching PDF contents from URL...");
        const response = await fetch(file.url);
        if (response.ok) {
          console.log("[UploadThing onUploadComplete] PDF fetched successfully. Parsing buffer...");
          const arrayBuffer = await response.arrayBuffer();
          const bytes = Buffer.from(arrayBuffer);
          const parsed = await pdf(bytes);
          textContent = parsed.text || "";
          console.log("[UploadThing onUploadComplete] PDF parsing complete. Length of parsed text:", textContent.length);
        } else {
          console.error(`[UploadThing onUploadComplete] Failed to fetch uploaded PDF from ${file.url}: ${response.status} ${response.statusText}`);
        }
      } catch (parseError) {
        console.error("[UploadThing onUploadComplete] Error parsing uploaded PDF:", parseError);
      }

      try {
        console.log("[UploadThing onUploadComplete] Creating database document entry...");
        const newDoc = await prisma.document.create({
          data: {
            userId: metadata.mongoUserId,
            fileName: file.name,
            fileUrl: file.url,
            fileKey: file.key,
            status: "UPLOADED",
            textContent,
          },
        });
        console.log("[UploadThing onUploadComplete] Successfully saved document to database. ID:", newDoc.id);
      } catch (dbError) {
        console.error("[UploadThing onUploadComplete] Database error during document creation:", dbError);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;