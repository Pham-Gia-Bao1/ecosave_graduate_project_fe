import { ProductDescriptionProps } from "@/types";
import { formatDateTime } from "@/utils";

export function ProductDescription({
  description,
  details,
}: ProductDescriptionProps) {
  const infoItems = [
    { label: "Ngày hết hạn", value: details.expiration_date ? formatDateTime(details.expiration_date) : null },
    { label: "Xuất xứ", value: details.origin },
    { label: "Hướng dẫn sử dụng", value: details.usage_instructions },
    { label: "Bảo quản", value: details.storage_instructions },
  ].filter((item) => item.value); // Lọc bỏ các mục không có giá trị

  return (
    <div className="mt-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Description Column */}
        {description && (
          <div>
            <h2 className="text-lg font-medium mb-4 bg-gray-50 p-4">Mô tả</h2>
            <div className="space-y-4 text-gray-600">
              <p>{description}</p>
            </div>
          </div>
        )}

        {/* Information Column */}
        {infoItems.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-2 bg-gray-50 p-4">Thông tin</h2>
            <div className="space-y-2">
              <div className="grid gap-2">
                {infoItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-8 py-2 border-b">
                    <span className="text-gray-600 w-[180px]">{item.label}</span>
                    <span className="flex-1">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
