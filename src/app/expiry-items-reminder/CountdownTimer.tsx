import { useState, useEffect } from "react";

const getTimeRemaining = (expiryDate: string) => {
  const now = new Date().getTime();
  const expiry = new Date(expiryDate).getTime();
  const diff = expiry - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
};

const CountdownTimer = ({ expiryDate }: { expiryDate: string }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(expiryDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(expiryDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div
      className={`w-full max-w-md mx-auto mt-4 text-center ${
        timeLeft.expired ? "bg-red-500 text-white" : "bg-green-200 text-gray-900"
      } transition-all duration-500`}
    >
      {timeLeft.expired ? (
        <p className="text-2xl font-semibold">⏳ Đã hết hạn</p>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <p className="text-lg font-medium">⏳ Thời gian còn lại:</p>
          <div className="flex space-x-3 text-3xl font-bold">
            <span className="bg-white px-4 py-2">{timeLeft.days}d</span>
            <span className="bg-white px-4 py-2">{timeLeft.hours}h</span>
            <span className="bg-white px-4 py-2">{timeLeft.minutes}m</span>
            <span className="bg-white px-4 py-2">{timeLeft.seconds}s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
