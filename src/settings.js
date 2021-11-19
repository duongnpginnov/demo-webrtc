import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

export const appId = "d67702adcbfc43cfbf51b85e192d2f48";
export const token =
  "006d67702adcbfc43cfbf51b85e192d2f48IAAF4NRfjnOR0M6IVkMLr1k5cq3xU4kxPzxUbykeN9YSYe3Q8zEAAAAAEAC/UHVFcueBYQEAAQBy54Fh";

export const config = { mode: "rtc", codec: "vp8" };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "test-video";
