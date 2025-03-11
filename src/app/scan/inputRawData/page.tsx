import { getAccessToken } from "@/utils/helpers/getAccessToken";
import { redirect } from "next/navigation";
import ProductFormComponent from "./ProductFormComponent";
const ScanPage = () => {
  const token = getAccessToken();
    if (!token) {
      redirect("/login");
    }
  return (
    <div className="p-4">
      <ProductFormComponent />
    </div>
  );
};
export default ScanPage;
