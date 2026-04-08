import { BadRequest, InternalServerError } from "@/lib/http/response";
import { ZodError } from "zod";
import { TRANSCRIPTION_FORM_FIELD_NAME } from "../constants";
import { transcriptionAudioFileSchema } from "../schema/audio-file";
import { transcribeAudioFile } from "../server";

export async function postHandler(request: Request, _userId: string) {
  try {
    const formData = await request.formData();
    const audioFile = transcriptionAudioFileSchema.parse(
      formData.getAll(TRANSCRIPTION_FORM_FIELD_NAME),
    );
    const transcript = await transcribeAudioFile(audioFile);
    return Response.json(transcript);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (error instanceof TypeError) {
      return BadRequest("Audio upload must use multipart form data.");
    }

    if (error instanceof ZodError) {
      return BadRequest(error.issues[0]?.message ?? "Invalid audio upload.");
    }

    return InternalServerError("Internal server error");
  }
}
