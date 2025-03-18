export const convertToVietnamTime = (timeRange: string): string => {
    return timeRange
        .replace(/\b9:00 AM\b/, "09:00")
        .replace(/\b9:00 PM\b/, "21:00")
        .replace(/\s*AM|\s*PM/g, "") // Xóa AM/PM dư thừa nếu có
        .trim();
};

export const removeAMPM = (dateTime: string | null): string => {
    if (!dateTime) return "Chưa cập nhật"; // Nếu null hoặc undefined, trả về thông báo mặc định
    return dateTime.replace(/\s*AM|\s*PM/g, "").trim(); // Xóa "AM" hoặc "PM" nếu có
};
