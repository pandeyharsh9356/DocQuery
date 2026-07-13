import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import pdf from "pdf-parse";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new Error("Unauthorized");
      }

      let mongoUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });

      if (!mongoUser) {
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
      }

      return { mongoUserId: mongoUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      let textContent = "";
      try {
        const response = await fetch(file.url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const bytes = Buffer.from(arrayBuffer);
          const parsed = await pdf(bytes);
          textContent = parsed.text || "";
        } else {
          console.error(`Failed to fetch uploaded PDF from ${file.url}: ${response.statusText}`);
        }
      } catch (parseError) {
        console.error("Error parsing uploaded PDF:", parseError);
      }

      await prisma.document.create({
        data: {
          userId: metadata.mongoUserId,
          fileName: file.name,
          fileUrl: file.url,
          fileKey: file.key,
          status: "UPLOADED",
          textContent,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;