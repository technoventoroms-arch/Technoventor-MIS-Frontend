export const getNotifications = async () => {
  return fetch(`${import.meta.env.VITE_PUBLIC_API_ENDPOINT}events`, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
    },
  });
};
