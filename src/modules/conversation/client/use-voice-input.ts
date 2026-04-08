"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { TRANSCRIPTION_FORM_FIELD_NAME } from "@/modules/transcription/constants";
import { transcriptionResponseSchema } from "@/modules/transcription/schema/response";

type VoiceStatus = "idle" | "recording" | "transcribing";

type UseVoiceInputOptions = {
  onInputChange: Dispatch<SetStateAction<string>>;
};

const PERMISSION_DENIED_MESSAGE = "Microphone access was denied.";
const NOT_SUPPORTED_MESSAGE = "Voice input is not supported in this browser.";
const EMPTY_TRANSCRIPT_MESSAGE = "No speech was detected. Please try again.";
const FAILED_TRANSCRIPTION_MESSAGE = "Voice input failed. Please try again.";

export function useVoiceInput({ onInputChange }: UseVoiceInputOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopRecording();
      stopStream();
    };
  }, []);

  function stopStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }

  async function transcribeAudio(audioBlob: Blob) {
    const audioType = audioBlob.type || "audio/webm";
    const audioFile = new File([audioBlob], "voice-input.webm", { type: audioType });
    const formData = new FormData();
    formData.append(TRANSCRIPTION_FORM_FIELD_NAME, audioFile);

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(await response.text());

    const parsedResponse = transcriptionResponseSchema.safeParse(await response.json());
    if (!parsedResponse.success) throw new Error(FAILED_TRANSCRIPTION_MESSAGE);
    return parsedResponse.data.text.trim();
  }

  async function handleRecordedAudio(audioBlob: Blob) {
    if (audioBlob.size === 0) {
      setStatus("idle");
      setErrorMessage(EMPTY_TRANSCRIPT_MESSAGE);
      return;
    }

    setStatus("transcribing");

    try {
      const transcript = await transcribeAudio(audioBlob);

      if (!transcript) {
        setErrorMessage(EMPTY_TRANSCRIPT_MESSAGE);
        return;
      }

      onInputChange((input) => [input.trim(), transcript].filter(Boolean).join(" "));
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : FAILED_TRANSCRIPTION_MESSAGE;
      setErrorMessage(message);
    } finally {
      setStatus("idle");
    }
  }

  async function startRecording() {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setErrorMessage(NOT_SUPPORTED_MESSAGE);
      return;
    }

    try {
      setErrorMessage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);

      audioChunksRef.current = [];
      mediaStreamRef.current = mediaStream;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        stopStream();
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        void handleRecordedAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? PERMISSION_DENIED_MESSAGE
          : FAILED_TRANSCRIPTION_MESSAGE;
      setErrorMessage(message);
      setStatus("idle");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }

  function onVoiceClick() {
    if (status === "transcribing") return;

    if (status === "recording") {
      stopRecording();
      return;
    }

    void startRecording();
  }

  return {
    errorMessage,
    isRecording: status === "recording",
    isTranscribing: status === "transcribing",
    onVoiceClick,
  };
}
