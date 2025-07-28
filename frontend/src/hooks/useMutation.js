import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/features/user/userSlice";
import apiHandler from "../functions/apiHandler";

const useMutation = (params = { cb: null }) => {
  const { cb } = params;
  const [data, setData] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const mutate = async (query) => {
    setLoading(true);
    try {
      const response = await apiHandler(query);
      if (response.status === 403 || response.status == 401) {
        handleLogout();
      }
      if (cb) {
        setData(cb(response));
      } else {
        setData(response);
      }
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, mutate };
};

export default useMutation;
