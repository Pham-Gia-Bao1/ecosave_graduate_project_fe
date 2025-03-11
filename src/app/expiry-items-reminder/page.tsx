import { getAccessToken } from "@/utils/helpers/getAccessToken";
import { redirect } from "next/navigation";
import ExpiryItemsReminder from "./ExpiryItemsReminder";
const ExpiryPage = () => {
  const token = getAccessToken();
    if (!token) {
      redirect("/login");
    }
  return (
    <div className="p-">
      <ExpiryItemsReminder />
    </div>
  );
};
export default ExpiryPage;
