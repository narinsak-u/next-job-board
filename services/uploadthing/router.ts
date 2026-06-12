import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/getCurrentAuth";
import { inngest } from "../inngest/client";
import { upsertUserResume } from "@/features/users/db/userResumes";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { uploadthing } from "./client";

const f = createUploadthing();

// # Resume Uploader Tool
// 1. Check if user is signed in
// 2. Check if user has permission to upload resume
// 3. Parse the resume file
// 4. Upload the resume file to UploadThing
// 5. Update the user's resume file key in the database
// 6. Return success message
export const customFileRouter: FileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true }
  )
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      if (userId == null) throw new UploadThingError("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;
      const resumeFileKey = await getUserResumeFileKey(userId);

      await upsertUserResume(userId, {
        resumeFileUrl: file.ufsUrl,
        resumeFileKey: file.key,
      });

      if (resumeFileKey != null) {
        await uploadthing.deleteFiles(resumeFileKey);
      }

      await inngest.send({ name: "app/resume.uploaded", data: {}, user: { id: userId } } as any);

      return { message: "Resume uploaded successfully" };
    }),
} satisfies FileRouter;

export type CustomFileRouter = typeof customFileRouter;

// # Helper functions: Get user resume file key
async function getUserResumeFileKey(userId: string) {
  const data = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: {
      resumeFileKey: true,
    },
  });

  return data?.resumeFileKey;
}
