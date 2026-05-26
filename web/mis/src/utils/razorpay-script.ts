export const loadScript = (src: string) =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
