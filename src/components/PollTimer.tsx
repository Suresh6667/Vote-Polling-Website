import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function PollTimer({ expiry, createdAt }: { expiry: string; createdAt: string }) {
  const expiryTime = new Date(expiry).getTime();
  const createdTime = new Date(createdAt).getTime();
  const totalDuration = expiryTime - createdTime;

  const [timeLeft, setTimeLeft] = useState(expiryTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(expiryTime - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  if (timeLeft <= 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-red-600 font-semibold">
          <Clock className="w-4 h-4" /> Expired
        </span>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 w-0" />
        </div>
      </div>
    );
  }

  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

  const progress = Math.max(0, (timeLeft / totalDuration) * 100);

  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-blue-700 font-medium">
        <Clock className="w-4 h-4" />
        {hoursLeft > 0 && `${hoursLeft}h `}
        {minutesLeft > 0 && `${minutesLeft}m `}
        {secondsLeft}s left
      </span>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default PollTimer;
