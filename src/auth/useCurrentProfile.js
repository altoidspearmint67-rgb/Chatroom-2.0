import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

import {
  useAuth,
} from "./AuthContext";


export function useCurrentProfile() {
  const {
    user,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);

      return;
    }


    setLoading(true);


    const unsubscribe =
      onSnapshot(
        doc(
          db,
          "users",
          user.uid,
        ),
        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            setProfile({
              id:
                snapshot.id,

              ...snapshot.data(),
            });
          } else {
            setProfile(null);
          }

          setLoading(false);
        },
        (error) => {
          console.error(
            "Failed to load user profile:",
            error,
          );

          setLoading(false);
        },
      );


    return unsubscribe;
  }, [
    user,
  ]);


  return {
    profile,
    loading,
  };
}