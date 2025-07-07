import {
  Disc2,
  LayoutGrid,
  MessageSquareText,
  Mic,
  MicOff,
  MonitorUp,
  Phone,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

export default function LivePageBottomNav() {
  return (
    <>
      <div className="">
        <div className="flex items-center">
          <VideoOff />
          <Phone className="rotate-140" />
          <Video />
          <Mic />
          <MicOff />
          <LayoutGrid />
          <Users />
          <MessageSquareText />
          <MonitorUp />
          <Disc2 />
        </div>
      </div>
    </>
  );
}
