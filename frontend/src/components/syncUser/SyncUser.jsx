import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useRef } from "react";
import { API_BASE } from "../../config/api";

export default function SyncUser() {
  const { user, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasSynced.current) return;

    const sync = async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) return;

        const email     = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "";
        const username  = user.username || user.firstName || user.fullName || email.split("@")[0] || "User";
        const imageUrl  = user.imageUrl || "";

        const res = await axios.post(
          `${API_BASE}/api/users/sync`,
          { email, username, imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          hasSynced.current = true;
        }
      } catch (err) {
        console.error("SyncUser failed:", err.response?.data?.message || err.message);
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user, getToken]);

  return null;
}
