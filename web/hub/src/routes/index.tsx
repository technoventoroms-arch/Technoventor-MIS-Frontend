import { createBrowserRouter } from "react-router-dom";
import routes from "./router";

const browserRouter = createBrowserRouter(routes, { basename: "" });

export default browserRouter;
