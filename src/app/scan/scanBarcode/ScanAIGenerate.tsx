import { ProductScan } from "@/types";
import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

type ScanAIGenerateProps = { product?: ProductScan };

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const urlAI = process.env.NEXT_PUBLIC_GEMINI_API_URL;

export default function ScanAIGenerate({ product }: ScanAIGenerateProps) {
  const [error, setError] = useState<string | null>(null);
  const [fullText, setFullText] = useState<string | null>(null);
  const [loadingDots, setLoadingDots] = useState<string>(".");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getGenerateDataFromGeminiAI = useCallback(async () => {
    if (!product?.title) {
      setError("Không có thông tin sản phẩm để xử lý");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${urlAI}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Dựa trên thông tin sản phẩm sau, hãy gợi ý:
                  - **Phương pháp chế biến**
                  - **Cách bảo quản**
                  - **Khoảng thời gian sử dụng an toàn**

                  **Thông tin sản phẩm:**
                  - **Tên:** ${product.title || "Không có"}
                  - **Mô tả:** ${product.description || "Không có"}
                  - **Thương hiệu:** ${product.brand || "Không có"}
                  - **Trọng lượng:** ${product.weight || "Không có"}
                  - **Kích thước:** ${product.dimensions || "Không có"}
                  - **Bảo hành:** ${product.warrantyInformation || "Không có"}
                  - **Ngày sản xuất:** ${product.manufacturingDate || "Không có"}
                  - **Ngày hết hạn:** ${product.expiryDate || "Không có"}

                  Trả lời chi tiết, có cấu trúc rõ ràng và **không có lỗi chính tả**.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Không thể kết nối đến API");

      const data = await response.json();
      setFullText(
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Không có dữ liệu phản hồi từ AI"
      );
    } catch (err) {
      setError((err as Error).message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  useEffect(() => {
    getGenerateDataFromGeminiAI();
  }, [getGenerateDataFromGeminiAI]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setLoadingDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="bg-white text-black p-6 rounded-lg transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 animate-fade-in-down">
        Một số gợi ý cho sản phẩm
      </h2>

      {error && <p className="text-red-500 animate-fade-in">{error}</p>}

      {isLoading ? (
        <div className="flex items-center space-x-2 animate-pulse">
          <p className="text-sm">Đang tải{loadingDots}</p>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : fullText ? (
        <div className="text-sm whitespace-pre-line animate-fade-in-up">
          <ReactMarkdown>{fullText}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm animate-fade-in">Không có dữ liệu để hiển thị</p>
      )}
    </div>
  );
}
