import { useEffect, useState } from "react";
import apiHandler from "../functions/apiHandler";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/features/user/userSlice";

export default function useQuery(url, { cb = null, skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiHandler({
        url,
      });
      if (response.status === 403 || response.status == 401) {
        handleLogout();
      }
      if (cb) {
        setData(cb(response));
      } else {
        setData(response);
      }
    } catch (error) {
      console.error("API fetch error:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (skip || !url) return;

    fetchData();
  }, [url, skip]);

  return { data, loading, error, refetch: fetchData };
}

export const generateParam = (params) => {
  const keys = Object.keys(params);
  const result = keys
    .map((key) => {
      return `${key}=${params[key]}`;
    })
    .join("&");
  return keys.length > 0 ? `${result}` : "";
};
