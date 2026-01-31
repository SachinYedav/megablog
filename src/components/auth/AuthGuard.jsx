import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { openAuthModal } from "../../store/authSlice";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children, authentication = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (authentication && authStatus !== authentication) {
      dispatch(openAuthModal("login"));
    }
    else if (!authentication && authStatus !== authentication) {
      navigate("/");
    }

    setLoader(false);
  }, [authStatus, navigate, authentication, dispatch]);

  return loader ? (
    <div className="w-full h-full flex items-center justify-center p-10">
      <Loader2 className="animate-spin text-gray-400" size={40} />
    </div>
  ) : (
    <>{children}</>
  );
}
