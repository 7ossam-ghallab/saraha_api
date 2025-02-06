import userRouter from "../Modules/user/user.controller.js";
import authRouter from "../Modules/auth/auth.controller.js";
import { globalErrorHandler } from "../Middlewares/errorHandler.middlewares.js";
import messagesRouter from "../Modules/message/message.controller.js";

export const controllerHandler = (app) => {
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messagesRouter);
  app.get('/', (req, res) => {
    res.send('hello world!');
  });

  app.all("*", (req, res) => {
    res.status(404).json({ message: "Page not found" });
  });

  // app.use(
  //   (err, req, res, next) => {
  //     if (err) return res.status(500).json({ Error_message: err.message})
  //   }
  // )
  app.use(globalErrorHandler);
};
