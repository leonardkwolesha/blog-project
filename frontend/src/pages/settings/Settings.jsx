import { UserProfile } from "@clerk/clerk-react";
import "./settings.css";

export default function Settings() {
  return (
    <div className="settings-page">
      <UserProfile />
    </div>
  );
}
