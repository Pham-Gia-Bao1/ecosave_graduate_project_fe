import Button from "@/components/button/ButtonScan";
import { getAccessToken } from "@/utils/helpers/getAccessToken";
import Link from "next/link";
import { redirect } from "next/navigation";
const ScanComponent = () => {
  const token = getAccessToken();
  console.log(token)
  if (!token) {
    // If no token, redirect to login
    redirect("/login");
  }
  return (
    <div className="flex flex-col items-center justify-center bg-white h-[500px] text-center px-4">
      {/* Logo */}
      <div className="w-32 h-32 bg-primary text-white flex items-center justify-center rounded-full mb-4">
        <span className="text-3xl font-bold">EcoSave</span>
      </div>
      {/* Tiêu đề */}
      <h1 className="text-4xl font-bold text-gray-700 mb-10">
        Lưu thông tin để nhắc nhở ngày hết hạn sản phẩm
      </h1>
      {/* Nút chức năng */}
      <div className="flex gap-4">
        <Link href="/scan/scanBarcode" passHref>
          <Button label="Quét mã Barcode" />
        </Link>
        <Link href="/scan/inputRawData" passHref>
          <Button label="Nhập thông tin sản phẩm" />
        </Link>
      </div>
      <p className="max-w-[450px] text-xs text-gray-500 text-justify mx-auto px-2 m-4">
        Quản lý hạn sử dụng sản phẩm của bạn một cách dễ dàng! Hãy quét mã
        barcode hoặc nhập thông tin sản phẩm để được nhắc nhở kịp thời, giúp bạn
        sử dụng sản phẩm hiệu quả và tránh lãng phí thực phẩm bảo vệ môi trường
        xanh sạch đẹp
      </p>
    </div>
  );
};
export default ScanComponent;
