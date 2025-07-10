export function toggleVideo(stream: MediaStream) {
  const videoTracks = stream.getVideoTracks();
  videoTracks.forEach(track => {
    track.enabled = !track.enabled;
  })
}

export function toggleAudio(stream: MediaStream) {
  const audioTracks = stream.getAudioTracks();
  audioTracks.forEach(track => {
    track.enabled = !track.enabled;
  })
}
